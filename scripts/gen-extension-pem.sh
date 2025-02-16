#!/bin/bash

openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out extension.pem