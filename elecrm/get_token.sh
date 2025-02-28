#!/bin/bash

# Send the request to SignalWire API
response=$(curl --location --request POST 'https://elevatedhl.signalwire.com/api/fabric/subscribers/tokens' \
--user "636ed463-ec04-45ad-9972-0b6923feacc4:PTdf202f859016055fa89da18902bb0451e112d4edcc221691" \
--header 'Content-Type: application/json' \
--data-raw '{
    "reference": "sboggs@elevated.loans"
}')

# Extract the token from the response
token=$(echo $response | jq -r '.token')

# Print the token for easy copying
echo "Your new token is: $token"
