rem openssl rsa -in private.key -text > private.pem
rem openssl x509 -in certificate.crt -text > certificate.pem

openssl pkcs12 -export -out "certificate_combined.pfx" -inkey "private.key" -in "certificate.crt" -certfile ca_bundle.crt -passout pass:
