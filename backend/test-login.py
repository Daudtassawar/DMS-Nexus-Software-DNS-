import urllib.request
import json
import ssl

url = 'http://localhost:5000/api/v1/auth/login'
data = {
    "Username": "LaiqAhmed",
    "Password": '38403"Sargodha#Laiq@3939@Ahmed'
}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'))
req.add_header('Content-Type', 'application/json')

try:
    response = urllib.request.urlopen(req)
    print("Status:", response.status)
    print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("Status:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))
