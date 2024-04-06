const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

const PORT = 8080;
const UPLOADS_DIRECTORY = './uploads/';

const server = http.createServer((req, res) => {
    const { method, url: reqUrl } = req;
    const parsedUrl = url.parse(reqUrl, true);
    const pathName = parsedUrl.pathname;
    
    // Function to send response
    const sendResponse = (statusCode, data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    };
    
    // Function to handle errors
    const handleError = (statusCode, message) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: message }));
    };

    // Function to get list of uploaded files
    const getFiles = () => {
        fs.readdir(UPLOADS_DIRECTORY, (err, files) => {
            if (err) {
                handleError(500, 'Internal Server Error');
                return;
            }
            sendResponse(200, { files });
        });
    };

    // Function to create file
    const createFile = () => {
      const { filename, content } = parsedUrl.query;
      if (!filename || !content) {
          handleError(400, 'Missing filename or content');
          return;
      }
      const filePath = path.join(UPLOADS_DIRECTORY, filename);
      fs.writeFile(filePath, content, (err) => {
          if (err) {
              handleError(500, 'Internal Server Error');
              return;
          }
          sendResponse(200, { message: 'File created successfully' });
      });
  };
    
    // Function to delete file
    const deleteFile = () => {
        const { filename } = parsedUrl.query;
        if (!filename) {
            handleError(400, 'Missing filename');
            return;
        }
        const filePath = path.join(UPLOADS_DIRECTORY, filename);
        fs.unlink(filePath, (err) => {
            if (err) {
                handleError(404, 'File not found');
                return;
            }
            sendResponse(200, { message: 'File deleted successfully' });
        });
    };

    // Function to get file content
    const getFileContent = () => {
        const { filename } = parsedUrl.query;
        if (!filename) {
            handleError(400, 'Missing filename');
            return;
        }
        const filePath = path.join(UPLOADS_DIRECTORY, filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                handleError(404, 'File not found');
                return;
            }
            sendResponse(200, { content: data });
        });
    };
    
    // Route requests
    if (method === 'GET' && pathName === '/getFiles') {
        getFiles();
    } else if (method === 'POST' && pathName === '/createFile') {
        createFile();
    } else if (method === 'DELETE' && pathName === '/deleteFile') {
        deleteFile();
    } else if (method === 'GET' && pathName === '/getFile') {
        getFileContent();
    } else {
        handleError(404, 'Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
