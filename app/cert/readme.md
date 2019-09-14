- put certificates here.
- run `generate-pfx.bat`.

# Getting certificates

https://www.sslforfree.com
- Should have access to port 80
- Should have access to port 21 (for ftp upload)

To .well-known\acme-challenge folder in IIS, add MIME types:
```
.* application/octet-stream
. application/octet-stream
```
renew after 90 days

