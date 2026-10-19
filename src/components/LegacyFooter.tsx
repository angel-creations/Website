export function LegacyFooter(): JSX.Element {
  return (
    <footer className="color_creme" data-scroll-section>
      <div className="footer_inner">
        <div className="col">
          <div className="menu_footer">
            <ul>
              <li>
                <a href="/privacy-policy/">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms-of-service/">Terms of Service</a>
              </li>
              <li>
                <a href="tel:+918058465733">+91-8058465733</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col">
          <p>© {new Date().getFullYear()} Angel Creations · Mobile: +91-8058465733</p>
        </div>
        <div className="col">
          <div className="soical">
            <a
              href="https://www.instagram.com/angelcreations.digital/"
              target="_blank"
              rel="noreferrer"
              aria-label="Angel Creations on Instagram"
            >
              <i className="fa-brands fa-instagram" aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com/angelcreations.digital/"
              target="_blank"
              rel="noreferrer"
              aria-label="Angel Creations on Facebook"
            >
              <i className="fa-brands fa-square-facebook" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
