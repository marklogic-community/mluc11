#!/usr/bin/python
"""
   Script to subscribe to list of lists
"""

import os
import sys

import requests
import json

host = 'localhost:8104'

url_base = 'http://' + host + '/data/jsonstore.xqy?uri=' 

d = "speakers"

for f in os.listdir(d):
    with open(d + "/" + f) as file: 
        payload = file.read()    
        url = url_base + "/speaker/" + f
        r = requests.put(url, data=payload)
        print r

d = "sessions"
for f in os.listdir(d):
    with open(d + "/" + f) as file: 
        payload = file.read()    
        url = url_base + "/session/" + f
        r = requests.put(url, data=payload)
        print r
