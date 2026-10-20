/* Minimal NSS/NSPR ABI shim so a Chromium build that hard-links libnss3 can start
   in a sandbox without the NSS packages. Chrome only touches these symbols for its
   client-certificate database; init fails cleanly and normal page rendering works. */
#include <stddef.h>
#include <stdint.h>
#include <time.h>
#include <string.h>

typedef int PRBool;
typedef int SECStatus;
typedef int PRInt32;
typedef long long PRTime;
typedef unsigned int PRUint32;

static int dummy_storage;

/* ---- NSPR ---- */
void PR_Init(int type, PRInt32 prio, PRInt32 max) { (void)type; (void)prio; (void)max; }
PRTime PR_Now(void) { struct timespec ts; clock_gettime(CLOCK_REALTIME, &ts); return (PRTime)ts.tv_sec * 1000000LL + ts.tv_nsec / 1000; }
PRInt32 PR_GetError(void) { return -5990; }
PRInt32 PR_GetOSError(void) { return 0; }
PRInt32 PR_GetErrorTextLength(void) { return 0; }
PRInt32 PR_GetErrorText(char *text) { if (text) text[0] = 0; return 0; }

/* ---- NSS ---- */
PRBool NSS_VersionCheck(const char *importedVersion) { (void)importedVersion; return 1; }
SECStatus NSS_NoDB_Init(const char *configdir) { (void)configdir; return -1; }
SECStatus NSS_InitReadWrite(const char *configdir) { (void)configdir; return -1; }
SECStatus NSS_SetAlgorithmPolicy(PRUint32 algorithm, PRUint32 policy, PRUint32 flags)
{ (void)algorithm; (void)policy; (void)flags; return -1; }

void CERT_DestroyCertList(void *list) { (void)list; }
void CERT_DestroyCertificate(void *cert) { (void)cert; }
void *CERT_DupCertificate(void *cert) { (void)cert; return NULL; }
void *CERT_GetDefaultCertDB(void) { return NULL; }
SECStatus CERT_GetCertTrust(const void *cert, void *trust) { (void)cert; (void)trust; return -1; }
PRBool CERT_IsUserCert(const void *cert) { (void)cert; return 0; }
void *CERT_FindCertByDERCert(void *db, const void *der) { (void)db; (void)der; return NULL; }
void *CERT_CreateSubjectCertList(void *list, void *db, const void *name, PRTime t, PRBool validOnly)
{ (void)list; (void)db; (void)name; (void)t; (void)validOnly; return NULL; }

void *PK11_GetInternalKeySlot(void) { return NULL; }
void *PK11_ReferenceSlot(void *slot) { return slot; }
void PK11_FreeSlot(void *slot) { (void)slot; }
void *PK11_GetModule(const void *slot) { (void)slot; return NULL; }
PRBool PK11_IsPresent(const void *slot) { (void)slot; return 0; }
PRBool PK11_NeedUserInit(const void *slot) { (void)slot; return 0; }
SECStatus PK11_InitPin(void *slot, const char *pw, const char *pin) { (void)slot; (void)pw; (void)pin; return -1; }
void PK11_SetPasswordFunc(void *func) { (void)func; }
const char *PK11_GetTokenName(const void *slot) { (void)slot; return ""; }
PRBool PK11_HasRootCerts(void) { return 0; }
PRBool PK11_HasAttributeSet(void *slot, void *key, int type, PRBool has) { (void)slot; (void)key; (void)type; (void)has; return 0; }
void *PK11_ListCerts(int type, void *pwarg) { (void)type; (void)pwarg; return NULL; }
void *PK11_ListCertsInSlot(void *slot) { (void)slot; return NULL; }
void *PK11_FindCertInSlot(void *slot, const void *der, void *pwarg) { (void)slot; (void)der; (void)pwarg; return NULL; }
void *PK11_FindGenericObjects(void *slot, const void *objclass) { (void)slot; (void)objclass; return NULL; }
void *PK11_GetNextGenericObject(void *obj) { (void)obj; return NULL; }
void PK11_DestroyGenericObjects(void *obj) { (void)obj; }
SECStatus PK11_ReadRawAttribute(int type, void *obj, void *attr) { (void)type; (void)obj; (void)attr; return -1; }

void *SECITEM_AllocItem(void *arena, void *item, unsigned int len) { (void)arena; (void)item; (void)len; return NULL; }
int SECITEM_FreeItem(void *item, PRBool freeit) { (void)item; (void)freeit; return 0; }

void SECMOD_DestroyModule(void *module) { (void)module; }
void *SECMOD_GetDefaultModuleList(void) { return NULL; }
void *SECMOD_GetDefaultModuleListLock(void) { return &dummy_storage; }
void *SECMOD_GetReadLock(void *moduleList) { (void)moduleList; return &dummy_storage; }
void SECMOD_ReleaseReadLock(void *moduleList) { (void)moduleList; }
void *SECMOD_LoadUserModule(char *modspec, void *parent, PRBool recurse) { (void)modspec; (void)parent; (void)recurse; return NULL; }
