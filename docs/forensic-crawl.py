#!/usr/bin/env python3
"""Read-only forensic crawler for angelcreations.in.
Saves source documents, discovery data, and a local archive of site-owned assets.
No forms are submitted and no POST/PUT/DELETE requests are made.
"""
from __future__ import annotations

import csv
import hashlib
import json
import mimetypes
import os
import re
import sys
import time
from collections import deque, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urljoin, urlparse, urlunparse, parse_qsl, urlencode, unquote
from xml.etree import ElementTree as ET

import requests
from bs4 import BeautifulSoup

BASE = "https://angelcreations.in"
HOSTS = {"angelcreations.in", "www.angelcreations.in"}
OUT = Path("/home/user/forensics")
RAW_DIR = OUT / "live-html"
ASSET_ROOT = OUT / "legacy-assets"
MAX_PAGES = 100
MAX_ASSET_BYTES = 35 * 1024 * 1024
MAX_TOTAL_BYTES = 105 * 1024 * 1024
TIMEOUT = 40
USER_AGENT = "AngelCreationsForensicArchive/1.0 (read-only migration audit)"

session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.7"})

# Cannot be content routes in an archival React migration crawl.
SKIP_PATH_PREFIXES = (
    "/wp-admin", "/wp-login", "/wp-json", "/wp-content", "/wp-includes",
    "/xmlrpc.php", "/cgi-bin",
)
SKIP_PATH_SUFFIXES = (
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico", ".avif",
    ".pdf", ".doc", ".docx", ".zip", ".mp4", ".webm", ".mov", ".mp3",
    ".woff", ".woff2", ".ttf", ".otf", ".css", ".js", ".map", ".xml", ".kml",
)
TRACKING_QUERY_KEYS = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"}
URL_RE = re.compile(r"(?:url\(\s*['\"]?([^'\")]+)|(?:(?:src|href)\s*[:=]\s*['\"])(https?://[^'\"\s]+))", re.I)
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)
ABS_URL_RE = re.compile(r"https?://[^'\"\s<>\\]+", re.I)


def now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def canonical_url(url: str, strip_fragment: bool = True) -> str:
    p = urlparse(url)
    scheme = (p.scheme or "https").lower()
    host = p.netloc.lower()
    path = re.sub(r"/{2,}", "/", p.path or "/")
    if host == "www.angelcreations.in":
        host = "angelcreations.in"
    # Query parameters are retained unless known tracking values.
    pairs = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if k.lower() not in TRACKING_QUERY_KEYS]
    query = urlencode(pairs, doseq=True)
    return urlunparse((scheme, host, path, "", query, "" if strip_fragment else p.fragment))


def same_site(url: str) -> bool:
    return urlparse(url).netloc.lower() in HOSTS


def is_content_candidate(url: str) -> bool:
    p = urlparse(url)
    if p.scheme not in ("http", "https") or p.netloc.lower() not in HOSTS:
        return False
    path = p.path.lower()
    if any(path.startswith(s) for s in SKIP_PATH_PREFIXES):
        return False
    if any(path.endswith(s) for s in SKIP_PATH_SUFFIXES):
        return False
    if p.query and not (p.query.startswith("s=") or p.query.startswith("p=")):
        return False
    return True


def clean_text(node) -> str:
    return " ".join(node.get_text(" ", strip=True).split()) if node else ""


def unique(items):
    seen = set(); result = []
    for item in items:
        if item and item not in seen:
            seen.add(item); result.append(item)
    return result


def meta_content(soup, key, attr="name"):
    tag = soup.find("meta", attrs={attr: key})
    return tag.get("content", "").strip() if tag else ""


def page_archive_path(url: str) -> Path:
    p = urlparse(url)
    path = unquote(p.path)
    if (not path or path == "/") and not p.query:
        return RAW_DIR / "index.html"
    clean = path.strip("/") or "index"
    # Distinguish query routes such as the live WordPress search endpoint from
    # their path-only page so raw evidence is never overwritten.
    if p.query:
        digest = hashlib.sha1(p.query.encode("utf-8")).hexdigest()[:10]
        clean = clean + "__query-" + digest
    if clean.endswith(".html"):
        return RAW_DIR / clean
    return RAW_DIR / clean / "index.html"


def asset_category(url: str, content_type: str = "") -> str:
    path = urlparse(url).path.lower()
    ct = content_type.lower().split(";")[0]
    name = Path(path).name.lower()
    if name.endswith(".svg") or ct == "image/svg+xml":
        return "svg"
    if "logo" in name:
        return "logos"
    if name.endswith((".woff", ".woff2", ".ttf", ".otf", ".eot")) or "font" in ct:
        return "fonts"
    if name.endswith((".mp4", ".webm", ".mov", ".m4v", ".avi", ".ogv")) or ct.startswith("video/"):
        return "videos"
    if name.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".ico", ".bmp")) or ct.startswith("image/"):
        return "images"
    if "fontawesome" in path or "icon" in name:
        return "icons"
    return "other"


def local_asset_path(url: str, content_type: str = "") -> Path:
    p = urlparse(url)
    category = asset_category(url, content_type)
    path = unquote(p.path).lstrip("/") or "index"
    # Query changes only cache/version, so don't add it to original name.
    return ASSET_ROOT / category / path


def public_asset_path(path: Path) -> str:
    return "/legacy-assets/" + str(path.relative_to(ASSET_ROOT)).replace(os.sep, "/")


def is_track_or_beacon(url: str) -> bool:
    low = url.lower()
    return any(x in low for x in ("google-analytics.com", "googletagmanager.com", "doubleclick.net", "facebook.net", "/pixel", "clarity.ms"))


def safe_get(url: str, **kwargs):
    try:
        return session.get(url, timeout=TIMEOUT, allow_redirects=True, **kwargs)
    except requests.RequestException as exc:
        return exc


def parse_sitemap(url: str, discovered: set[str], sitemap_records: list[dict]) -> None:
    response = safe_get(url)
    rec: dict[str, Any] = {"url": url, "fetched_at": now()}
    if isinstance(response, Exception):
        rec.update({"status": None, "error": str(response)})
        sitemap_records.append(rec); return
    rec.update({"status": response.status_code, "final_url": response.url, "content_type": response.headers.get("content-type", ""), "bytes": len(response.content)})
    sitemap_records.append(rec)
    if response.status_code != 200:
        return
    try:
        root = ET.fromstring(response.content)
    except ET.ParseError:
        return
    for loc in root.findall(".//{*}loc"):
        value = (loc.text or "").strip()
        if not value:
            continue
        if value.endswith("sitemap.xml") or "sitemap" in value and value.endswith(".xml"):
            if value not in {r["url"] for r in sitemap_records}:
                parse_sitemap(value, discovered, sitemap_records)
        elif same_site(value):
            discovered.add(canonical_url(value))


def extract_resource_urls(soup: BeautifulSoup, base: str) -> tuple[list[str], list[dict], list[dict], list[dict]]:
    assets: list[str] = []
    links: list[dict] = []
    forms: list[dict] = []
    embeds: list[dict] = []
    def resolve(value: str) -> str:
        return canonical_url(urljoin(base, value.strip())) if value.strip() else ""

    for a in soup.find_all("a", href=True):
        href = resolve(a["href"])
        links.append({"url": href, "text": clean_text(a), "rel": " ".join(a.get("rel", [])), "target": a.get("target", "")})
    for tag in soup.find_all(["img", "source", "video", "audio", "track", "script", "iframe", "embed", "object"]):
        for attr in ("src", "poster", "data-src", "data-lazy-src"):
            if tag.get(attr):
                value = resolve(tag[attr])
                if tag.name in ("iframe", "embed", "object"):
                    embeds.append({"tag": tag.name, "src": value, "title": tag.get("title", ""), "attributes": {k: str(v) for k, v in tag.attrs.items()}})
                else:
                    assets.append(value)
        if tag.get("srcset"):
            for entry in tag["srcset"].split(","):
                candidate = entry.strip().split(" ")[0]
                if candidate:
                    assets.append(resolve(candidate))
    for link in soup.find_all("link", href=True):
        rel = " ".join(link.get("rel", [])).lower()
        if any(x in rel for x in ("stylesheet", "preload", "icon", "manifest")):
            assets.append(resolve(link["href"]))
    for tag in soup.find_all(style=True):
        for match in CSS_URL_RE.finditer(tag.get("style", "")):
            if match.group(2) and not match.group(2).startswith("data:"):
                assets.append(resolve(match.group(2)))
    for style in soup.find_all("style"):
        for match in CSS_URL_RE.finditer(style.get_text()):
            if match.group(2) and not match.group(2).startswith("data:"):
                assets.append(resolve(match.group(2)))
    for form in soup.find_all("form"):
        fields = []
        for field in form.find_all(["input", "textarea", "select", "button"]):
            fields.append({"tag": field.name, "type": field.get("type", ""), "name": field.get("name", ""), "id": field.get("id", ""), "label": "", "required": field.has_attr("required"), "placeholder": field.get("placeholder", ""), "value": field.get("value", "")})
        forms.append({"action": resolve(form.get("action", base)), "method": form.get("method", "get").lower(), "id": form.get("id", ""), "class": " ".join(form.get("class", [])), "fields": fields})
    return unique(assets), links, forms, embeds


def page_record(url: str, response: requests.Response, soup: BeautifulSoup, assets, links, forms, embeds) -> dict[str, Any]:
    title = clean_text(soup.title)
    canonical_tag = soup.find("link", rel=lambda r: r and "canonical" in r)
    scripts = []
    for script in soup.find_all("script"):
        text = script.get_text(strip=True)
        scripts.append({"src": canonical_url(urljoin(response.url, script.get("src"))) if script.get("src") else "", "id": script.get("id", ""), "type": script.get("type", "text/javascript"), "inline": bool(text), "inline_preview": text[:300] if text else ""})
    styles = []
    for style in soup.find_all("link", href=True):
        rel = " ".join(style.get("rel", []))
        if "stylesheet" in rel:
            styles.append({"href": canonical_url(urljoin(response.url, style["href"])), "id": style.get("id", ""), "media": style.get("media", "all")})
    headings = {}
    for level in range(1, 7):
        headings[f"h{level}"] = [clean_text(h) for h in soup.find_all(f"h{level}") if clean_text(h)]
    jsonld = [s.get_text(strip=True) for s in soup.find_all("script", attrs={"type": "application/ld+json"})]
    meta = {}
    for m in soup.find_all("meta"):
        k = m.get("name") or m.get("property") or m.get("http-equiv")
        if k and m.get("content") is not None:
            meta[k] = m.get("content")
    images = []
    for im in soup.find_all("img"):
        src = im.get("src") or im.get("data-src") or im.get("data-lazy-src") or ""
        images.append({"src": canonical_url(urljoin(response.url, src)) if src else "", "alt": im.get("alt", ""), "width": im.get("width", ""), "height": im.get("height", ""), "class": " ".join(im.get("class", []))})
    videos = []
    for video in soup.find_all(["video", "audio"]):
        sources = []
        if video.get("src"):
            sources.append(canonical_url(urljoin(response.url, video["src"])))
        sources += [canonical_url(urljoin(response.url, s.get("src"))) for s in video.find_all("source", src=True)]
        videos.append({"tag": video.name, "sources": unique(sources), "poster": canonical_url(urljoin(response.url, video.get("poster"))) if video.get("poster") else "", "autoplay": video.has_attr("autoplay"), "muted": video.has_attr("muted"), "loop": video.has_attr("loop"), "controls": video.has_attr("controls"), "preload": video.get("preload", "")})
    buttons = [{"text": clean_text(b), "type": b.get("type", ""), "id": b.get("id", ""), "class": " ".join(b.get("class", []))} for b in soup.find_all("button")]
    return {
        "url": url, "final_url": canonical_url(response.url), "status": response.status_code, "content_type": response.headers.get("content-type", ""), "fetched_at": now(), "bytes": len(response.content),
        "title": title, "description": meta.get("description", ""), "canonical": canonical_tag.get("href", "") if canonical_tag else "", "robots": meta.get("robots", ""), "meta": meta,
        "headings": headings, "language": soup.html.get("lang", "") if soup.html else "", "body_classes": soup.body.get("class", []) if soup.body else [],
        "internal_links": [x for x in links if same_site(x["url"])], "external_links": [x for x in links if x["url"] and not same_site(x["url"])],
        "assets": assets, "images": images, "videos": videos, "embeds": embeds, "scripts": scripts, "stylesheets": styles, "json_ld": jsonld, "forms": forms, "buttons": buttons,
        "text_content": clean_text(soup.body),
    }


def process_asset(url: str, asset_records: dict[str, dict], asset_queue: deque[str], total: list[int]) -> None:
    if not url or url.startswith("data:") or url in asset_records:
        return
    parsed = urlparse(url)
    record: dict[str, Any] = {"original_url": url, "same_origin": parsed.netloc.lower() in HOSTS, "fetched_at": now()}
    asset_records[url] = record
    if not record["same_origin"]:
        record.update({"status": "external-not-downloaded", "reason": "Third-party resource recorded but not archived"})
        return
    if is_track_or_beacon(url):
        record.update({"status": "tracking-not-downloaded", "reason": "Analytics/tracking endpoint recorded, not requested"})
        return
    response = safe_get(url, stream=True)
    if isinstance(response, Exception):
        record.update({"status": "error", "error": str(response)}); return
    content_length = response.headers.get("content-length")
    try: expected = int(content_length) if content_length else None
    except ValueError: expected = None
    record.update({"http_status": response.status_code, "final_url": canonical_url(response.url), "content_type": response.headers.get("content-type", ""), "declared_size": expected})
    if response.status_code != 200:
        record["status"] = "not-downloaded"; response.close(); return
    if expected and expected > MAX_ASSET_BYTES:
        record.update({"status": "not-downloaded", "reason": f"Resource exceeds per-file archival safeguard ({MAX_ASSET_BYTES} bytes)"}); response.close(); return
    chunks = []; received = 0; exceeded = False
    try:
        for chunk in response.iter_content(chunk_size=65536):
            if not chunk: continue
            received += len(chunk)
            if received > MAX_ASSET_BYTES or total[0] + received > MAX_TOTAL_BYTES:
                exceeded = True; break
            chunks.append(chunk)
    finally:
        response.close()
    if exceeded:
        record.update({"status": "not-downloaded", "reason": "Archival size safeguard reached", "observed_size_before_stop": received}); return
    content = b"".join(chunks)
    dest = local_asset_path(url, record["content_type"])
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(content)
    total[0] += len(content)
    record.update({"status": "downloaded", "local_path": public_asset_path(dest), "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()})
    # CSS resource discovery; this is how font/image dependencies referenced by styles are retained.
    ctype = record["content_type"].lower()
    lowpath = urlparse(url).path.lower()
    if "text/css" in ctype or lowpath.endswith(".css"):
        try:
            css = content.decode("utf-8", errors="ignore")
            for match in CSS_URL_RE.finditer(css):
                ref = match.group(2).strip()
                if ref and not ref.startswith(("data:", "#")):
                    asset_queue.append(canonical_url(urljoin(response.url, ref)))
            for match in ABS_URL_RE.finditer(css):
                asset_queue.append(canonical_url(match.group(0)))
        except Exception:
            pass
    # JS textual references to direct media assets are captured, but not arbitrary URLs.
    if "javascript" in ctype or lowpath.endswith(".js"):
        try:
            js = content.decode("utf-8", errors="ignore")
            for match in ABS_URL_RE.finditer(js):
                ref = match.group(0).rstrip(".,;')\"]")
                if re.search(r"\.(?:jpg|jpeg|png|webp|gif|svg|mp4|webm|woff2?|ttf|otf)(?:\?|$)", ref, re.I):
                    asset_queue.append(canonical_url(ref))
        except Exception:
            pass


def rest_discovery(discovered: set[str], records: list[dict]) -> None:
    endpoints = [
        "/wp-json/wp/v2/pages?per_page=100", "/wp-json/wp/v2/posts?per_page=100",
        "/wp-json/wp/v2/product_spot?per_page=100", "/wp-json/wp/v2/virtual_tour?per_page=100",
    ]
    for endpoint in endpoints:
        url = BASE + endpoint
        res = safe_get(url)
        record: dict[str, Any] = {"url": url, "fetched_at": now()}
        if isinstance(res, Exception):
            record.update({"status": None, "error": str(res)})
        else:
            record.update({"status": res.status_code, "bytes": len(res.content), "content_type": res.headers.get("content-type", "")})
            if res.status_code == 200:
                try:
                    data = res.json(); record["items"] = len(data)
                    for item in data:
                        if item.get("link"):
                            discovered.add(canonical_url(item["link"]))
                except Exception as exc:
                    record["json_error"] = str(exc)
        records.append(record)


def main():
    for d in [OUT, RAW_DIR, ASSET_ROOT]: d.mkdir(parents=True, exist_ok=True)
    seeds: set[str] = {BASE + "/", BASE + "/this-route-does-not-exist-for-forensics-2026/"}
    sitemap_records: list[dict] = []
    parse_sitemap(BASE + "/sitemap_index.xml", seeds, sitemap_records)
    api_records: list[dict] = []
    rest_discovery(seeds, api_records)
    # Common linked/utility endpoints discovered from source or WordPress defaults.
    seeds.update({BASE + "/feed/", BASE + "/comments/feed/", BASE + "/?s=", BASE + "/works/"})
    queue = deque(sorted(seeds))
    visited: set[str] = set()
    pages: list[dict] = []
    asset_queue: deque[str] = deque()
    external_urls: set[str] = set()
    while queue and len(visited) < MAX_PAGES:
        url = canonical_url(queue.popleft())
        if url in visited or not is_content_candidate(url): continue
        visited.add(url)
        response = safe_get(url)
        if isinstance(response, Exception):
            pages.append({"url": url, "status": None, "error": str(response), "fetched_at": now()}); continue
        ctype = response.headers.get("content-type", "")
        if "html" not in ctype and "xml" not in ctype:
            pages.append({"url": url, "final_url": response.url, "status": response.status_code, "content_type": ctype, "bytes": len(response.content), "fetched_at": now()}); continue
        # Feed is source content, retained but not treated as a page / source DOM.
        if "html" not in ctype:
            path = page_archive_path(url).with_suffix(".xml")
            path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(response.content)
            pages.append({"url": url, "final_url": response.url, "status": response.status_code, "content_type": ctype, "bytes": len(response.content), "fetched_at": now(), "archive_path": str(path.relative_to(OUT))}); continue
        soup = BeautifulSoup(response.text, "lxml")
        assets, links, forms, embeds = extract_resource_urls(soup, response.url)
        rec = page_record(url, response, soup, assets, links, forms, embeds)
        archive = page_archive_path(url); archive.parent.mkdir(parents=True, exist_ok=True); archive.write_bytes(response.content)
        rec["archive_path"] = str(archive.relative_to(OUT))
        pages.append(rec)
        for asset in assets:
            if same_site(asset): asset_queue.append(asset)
            else: external_urls.add(asset)
        for script in rec["scripts"]:
            if script["src"]:
                if same_site(script["src"]): asset_queue.append(script["src"])
                else: external_urls.add(script["src"])
        for href in links:
            target = href["url"]
            if same_site(target) and is_content_candidate(target) and target not in visited:
                queue.append(target)
            elif target and not same_site(target):
                external_urls.add(target)
        for embed in embeds:
            if embed["src"] and not same_site(embed["src"]): external_urls.add(embed["src"])
        # Avoid rate limits while remaining minimally intrusive.
        time.sleep(0.05)
    asset_records: dict[str, dict] = {}
    total = [0]
    # Record known third party dependencies and referred outgoing URLs.
    for asset in sorted(external_urls):
        if not asset: continue
        if asset not in asset_records:
            asset_records[asset] = {"original_url": asset, "same_origin": False, "status": "external-not-downloaded", "reason": "Third-party link/dependency recorded but not archived", "fetched_at": now()}
    while asset_queue:
        process_asset(asset_queue.popleft(), asset_records, asset_queue, total)
        time.sleep(0.02)
    manifest = {
        "generated_at": now(), "base_url": BASE, "crawl_policy": {"read_only": True, "forms_submitted": False, "max_pages": MAX_PAGES, "asset_file_limit": MAX_ASSET_BYTES, "asset_total_limit": MAX_TOTAL_BYTES},
        "sitemaps": sitemap_records, "rest_discovery": api_records, "pages": pages, "assets": sorted(asset_records.values(), key=lambda x: x["original_url"]),
        "crawl_summary": {"seed_count": len(seeds), "page_records": len(pages), "visited_content_urls": len(visited), "asset_records": len(asset_records), "downloaded_asset_bytes": total[0], "queue_remaining": len(queue)},
    }
    (OUT / "forensic-manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    # Compact CSV useful for quick review.
    with (OUT / "url-status.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["url", "final_url", "status", "content_type", "title", "canonical", "description", "archive_path"])
        writer.writeheader()
        for rec in pages:
            writer.writerow({k: rec.get(k, "") for k in writer.fieldnames})
    print(json.dumps(manifest["crawl_summary"], indent=2))

if __name__ == "__main__":
    main()
