# Amazon_API
These folders contain different ways of implementing an API for extracting information about Amazon Products.
<br>The data is extracted in realtime from the Amazon website.
<br>Tools used: NodeJS
<br>&emsp;&emsp;&emsp;&emsp;&emsp;ThunderClient (For Testing)
<br>The cmds.txt file in a folder has instructions on what dependencies to install and how to run the program.              

## Pre-Requisites/ Pre-Installation:
<hr>

1. Node.js
2. Postman or Thunderclient

## Commands to run
<hr>

### Install all the node packages required
* ```cd Final_API```

* ```npm init``` (keep all the values to default.)

* ```npm install```

### Run the API
```node new.js```

## The URL link to Postman and ThunderClinet
### choose either one
1. For get request with its query:
```http://localhost:5000/search?title=<ProductName>&maxPages=<int>```

2. For Post request:
```http://localhost:5000/search```

    now select request body and choose JSON

JSON Content:

```
{ 
    "title": "<ProductName>", 
    "maxPages": <int>
}
```

### Now click the send button and the response will be like

``` 
[
  {
    "title": "string",
    "price": 0,
    "image": "string"
  }
]
```
