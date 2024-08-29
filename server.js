// index.json
var generator = require('generate-password');
const fs = require('fs');
const https = require('https');
const express = require('express');
const multer = require('multer');
const app = express();
const port = 8000;
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('html', require('ejs').renderFile);

var options = {
  key: key,
  cert: cert
};
// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  },
});

const upload = multer({ storage });

// File Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  var pass=generator.generate({	length: 10,	numbers: true});
  bcrypt.genSalt(saltRounds).then(salt => {
    return bcrypt.hash(pass, salt);
  }).then(hash => {
   var jsonpwd={'filename':req.file.filename,'pass':hash};
  fs.writeFile('pass/'+req.file.filename+'.json', JSON.stringify(jsonpwd), (error) => {
  if (error) {
    console.log('An error has occurred ', error);
    return;
  }
});
  res.json({ message: 'File uploaded successfully', filename: req.file.filename,password:  pass});
  })
  .catch(err => console.error(err.message))
  
});

app.get('/form', (req, res) => {
	
	  res.render("form.html", {fileName:req.query.fileName});

});



app.post('/unlock', (req, res) => {
	
  
   fs.readFile(`pass/${req.body.fileName}.json`, "utf8", (error, data) => {
  if (error) {
    console.log(error);
    return;
  }
	const verified = bcrypt.compareSync(req.body.password, JSON.parse(data).pass);
	console.log(verified);
	if (verified==true)
	{
		
	  
  const filePath = `uploads/${req.body.fileName}`; // or any file format
					// Check if file specified by the filePath exists
					fs.exists(filePath, function (exists) {
						if (exists) {
							// Content-type is very interesting part that guarantee that
							// Web browser will handle response in an appropriate manner.
							res.writeHead(200, {
								"Content-Type": "application/octet-stream",
								"Content-Disposition": "attachment; filename=" + req.body.fileName
							});
							fs.createReadStream(filePath).pipe(res);
							return;
						}
						res.writeHead(400, { "Content-Type": "text/plain" });
						res.end(`ERROR File ${filePath} does not exist`);
					});
					
					
					

	}
         
				

  
  
  
});
   	  
 
});
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
var server = https.createServer(options, app);

server.listen(port, () => {
  console.log("server starting on port : " + port)
});
