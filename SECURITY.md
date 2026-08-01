# Security policy

Please report suspected vulnerabilities through GitHub's private vulnerability
reporting for this repository. Do not include credentials, access tokens, private
keys, or personal data in a public issue.

Shellf uses browser-managed AT Protocol OAuth. OAuth sessions and DPoP keys are
stored in the browser's IndexedDB and should never be logged or sent to the Shellf
application server.
