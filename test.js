var http = require('http');
var fs = require('fs');
var bodyparser = require('body-parser');
const MongoClientATLAS = require('mongodb').MongoClient;

const assert = require('assert');

var express= require('express');
var app= express();

var urlencodedparserhome=bodyparser.urlencoded({extended:false});
var user='';
var login=0;
var usernameexists=false;
var loginagain=false;
var resetusername=false;
var old_password='';
/*
login=0 unattempted login
login=1 invalid username/password
login=2 successful
usernameexists =true while signing up new user has provided a username which already exists
loginagain=true after successful sign up user is asked to login again
resetusername= true user has successfully provided us with his/her username
*/

app.set('view engine','ejs');


// Connection URL
// const url = 'mongodb://localhost:27017';
 
// Database Name
// const dbName = 'local';



// const url = 'mongodb+srv://krishna:krishna123@cluster0.mongodb.net/admin';
const url ="mongodb+srv://krishna:krishna123@cluster0-1bhau.mongodb.net/test?retryWrites=true";
const dbName = 'ClosedLoopDB';
const MongoClient = new MongoClientATLAS(url, { useNewUrlParser: true });
MongoClient.connect(err => {
	console.log('connection established!!');
});

// using html
app.use('/images', express.static('pages/images'));
app.use('/assets/css', express.static('pages/assets/css'));
app.use('/assets/js', express.static('pages/assets/js'));
//app.use('/', express.static('pages'));
app.use('/signup', express.static('pages'));

//now using ejs
//app.use('/views', express.static('views'));
//app.use('/#menu', express.static('pages'));


app.get('/', function(req,res){
	console.log('firing index ejs!');
	resetusername=false;
	var data={username:user, login:login};
	res.render('index',{data});

});

app.get('/districtrating.ejs',function(req,res){

	if(user!='')
	{
		var data={notfound:false,foundrating:false};
		res.render('districtrating',{data});
	}
	else
	{
		res.redirect('/');
	}

});

app.get('/changepassword.ejs', function(req,res){
	console.log('firing changepassword ejs!');
	if(user!='')
	{
		//MongoClient.connect(err => {
		  	//assert.equal(null, err);
	 
			const db = MongoClient.db(dbName);

			const findDocuments = function(db, callback) {
			 	// Get the documents collection
			  	const collection = db.collection('closedLoop');
			 	// Find some documents
			 	collection.find({'username':user}).toArray(function(err, docs) {
			    ////assert.equal(err, null);
			    console.log("Found the following records");
			    console.log(docs);
			   	old_password=docs[0].password;

			    callback(docs);
				});
			};

			findDocuments(db, function() {
		    //MongoClient.close();
		  	});	
	 
	  ////MongoClient.close();
		// });


		res.render('changepassword');
	}
	else{
		res.redirect('/');
	}

});

app.get('/signout.ejs', function(req,res){
	console.log('signing out!');
	user='';
	login=0;
	old_password='';
	res.redirect('/');

});

app.get('/provideratings.ejs',function(req,res){
	if(user==='')
	{
		res.redirect('/signout.ejs');
	}
	var data={found:false};
	res.render('provideratings',{data});

});

/*app.get('/:username', function(req,res){
	console.log('firing index ejs by '+req.params.username);
	var data={username:req.params.username, login:2};
	res.render('index',{data});

});*/

app.get('/signin.ejs', function(req,res){
	console.log('firing signin ejs!');
	var data={login:login, loginagain:loginagain};
	if(loginagain=true)
		loginagain=false;
	if(login==1)
		login=0;
	res.render('signin',{data});

});
app.get('/signup.ejs', function(req,res){
	console.log('firing signin ejs!');
	var data={usernamealreadyexists:usernameexists};
	if(usernameexists==true)
		usernameexists=false;
	res.render('signup',{data});

});
app.get('/resetpassword.ejs', function(req,res){
	console.log('firing resetpassword ejs!:'+resetusername);
	if(resetusername==true)
	{
		//MongoClient.connect(err => {
	  	//assert.equal(null, err);
	 	console.log("in the get function of resetpassword:"+resetusername);
 
		const db = MongoClient.db(dbName);

		const findDocuments = function(db, callback) {
		 	// Get the documents collection
		  	const collection = db.collection('closedLoop');
		 	// Find some documents
		 	collection.find({'username':user}).toArray(function(err, docs) {
		    ////assert.equal(err, null);
		    console.log("Found the following records");
		    console.log(docs);
		   
		   	if(docs != null && docs.length > 0){
		   		console.log('inside the found something condition');
		   		var data={resetusername:resetusername,security_question:docs[0].security_question};
		   		console.log(data);
		   		res.render('resetpassword',{data});
		    }
		    else{
		    	console.log('inside the not found anything condition');
		    	console.log('username incorrect');
				resetusername=false;
				user='';
				res.redirect('/resetpassword.ejs');
		    }

		    callback(docs);
			});
		};

		findDocuments(db, function() {
	    //MongoClient.close();
	  	});	
 
  ////MongoClient.close();
	// });

		//resetusername=false;	
	}
	else
	{
		var data={resetusername:resetusername};
		res.render('resetpassword',{data});
	}
	

});


app.post('/districtrating.ejs',urlencodedparserhome,function(req,res){

	if(user==='')
	{
		res.redirect('/');
	}
	//MongoClient.connect(err => {
	  	//assert.equal(null, err);
	 	console.log("seaching previous rating on the same district");
 
		const db = MongoClient.db(dbName);
		

		const findDocuments = function(db, callback) {
		 	// Get the documents collection
		  	const collection = db.collection('closedLoopData');
		 	// Find some documents
		 	collection.find({'state':req.body.states,'district':req.body.districts}).toArray(function(err, docs) {
		    ////assert.equal(err, null);
		    console.log("Found the following records");
		    console.log(docs);
		    if(docs != null && docs.length > 0)
		   	{
		   		var rating=0.000000;
		   		var reviews="";
		   		for(i=0;i<docs.length;i++)
		   		{
		   			reviews+=docs[i].review;
		   			reviews+="<br>";
		   			rating+=parseInt(docs[i].rating);                                 
		   		}
		   		console.log(rating+' and i ='+i);
		   		rating/=i;
		   		var string='width:'+rating*20+'%';
		   		data={notfound:false,foundrating:true,rating:rating,district:req.body.districts,noofratings:i,string:string,reviews:reviews};
		   		console.log(string);
		   		res.render('districtrating',{data});
		   	}
		   	else if(user!='')
		   	{
				data={notfound:true,foundrating:false};
		   		res.render('districtrating',{data});	
					   		
		   	}

			callback(docs);
			});
			

		};
		findDocuments(db, function() {
	    //MongoClient.close();
	  	});

	  	
	// });  		
 		   	
	
});




app.post('/provideratings.ejs',urlencodedparserhome,function(req,res){

	if(user==='')
	{
		res.redirect('/');
	}
	//MongoClient.connect(err => {
	  	//assert.equal(null, err);
	 	console.log("seaching previous rating on the same district");
 
		const db = MongoClient.db(dbName);
		

		const findDocuments = function(db, callback) {
		 	// Get the documents collection
		  	const collection = db.collection('closedLoopData');
		 	// Find some documents
		 	collection.find({'username':user,'state':req.body.states,'district':req.body.districts}).toArray(function(err, docs) {
		    ////assert.equal(err, null);
		    console.log("Found the following records");
		    console.log(docs);
		    if(docs != null && docs.length > 0)
		   	{
		   		data={found:true};
		   		res.render('provideratings',{data});
		   	}
		   	else if(user!='')
		   	{
				const insertDocuments = function(db, callback) {
						  	// Get the documents collection
		 					const collection = db.collection('closedLoopData');
						  	// Insert some documents
		 					collection.insertMany([{username:user,state:req.body.states,district:req.body.districts,rating:req.body.rating,review:req.body.review}], function(err, result) {
		    				////assert.equal(err, null);
		    				assert.equal(1, result.result.n);
		    				assert.equal(1, result.ops.length);
		    				console.log("Inserted 1 documents into the data collection of closed loop");
		    				callback(result);
							});
						};

						insertDocuments(db, function() {
		    			//MongoClient.close();
						});
						res.redirect('/');		   		
		   	}

			callback(docs);
			});
			

		};
		findDocuments(db, function() {
	    //MongoClient.close();
	  	});

	  	
	// });  		
 		   	
	
});

app.post('/resetpassword.ejs', urlencodedparserhome, function(req,res){
	if(resetusername==true)
	{
		//MongoClient.connect(err => {
	  	//assert.equal(null, err);
	 	console.log("seaching your user");
 
		const db = MongoClient.db(dbName);

		const findDocuments = function(db, callback) {
		 	// Get the documents collection
		  	const collection = db.collection('closedLoop');
		 	// Find some documents
		 	collection.find({'username':user}).toArray(function(err, docs) {
		    ////assert.equal(err, null);
		    console.log("Found the following records");
		    console.log(docs);
		   	
		   	
			if(docs[0].security_answer===req.body.security_answer){
			   	console.log('matched');
			   	//old_password=docs[0].password;
			   	res.redirect('/resetpasswordlaststage.ejs');
			}
			else
			{
			    console.log('not matched');
				res.redirect('/resetpassword.ejs');
			}
			

		    callback(docs);
			});
		};

		findDocuments(db, function() {
	    //MongoClient.close();
	  	});	
 
  ////MongoClient.close();
	// });

	}
	else
	{
		user=req.body.username;
		resetusername=true;
		res.redirect('/resetpassword.ejs');
	}

});



app.get('/resetpasswordlaststage.ejs', function(req,res){
	console.log('firing alst stage of resetpassword !');
	res.render('resetpasswordlaststage');

});

app.post('/resetpasswordlaststage.ejs', urlencodedparserhome, function(req,res){
	
	console.log("inside the resetpasswordlaststage post method");
	//MongoClient.connect(err => {
	    //assert.equal(null, err);
	    console.log("Connected successfully to server");
	 
	    const db = MongoClient.db(dbName);
	    

	    	
		
		console.log('user input new password is '+req.body.password);

		
		
			const updateDocument = function(db, callback) {
		  		// Get the documents collection
		  		const collection = db.collection('closedLoop');
		  		// Update the password where username matches

		  		collection.updateOne({ username : user }
		    	, { $set: { password : req.body.password } }, function(err, result) {
		    	console.log("Updated the password of"+user);
		    	resetusername=false;
		    	user='';
		    	res.redirect('/signin.ejs');
		    	callback(result);
		  		});  
			};


		  		
		   		updateDocument(db, function() {
		    	//MongoClient.close();
		  		});
	   	
  	// });


});

app.post('/changepassword.ejs', urlencodedparserhome, function(req,res){
	
	console.log("inside the changepassword post method");
	//MongoClient.connect(err => {
	    //assert.equal(null, err);
	    console.log("Connected successfully to server");
	 
	    const db = MongoClient.db(dbName);
	    

	    	
		console.log('old password is '+old_password);
		console.log('user input old password is '+req.body.old_password);

		
		if(old_password==req.body.old_password)
	  	{
			const updateDocument = function(db, callback) {
		  		// Get the documents collection
		  		const collection = db.collection('closedLoop');
		  		// Update the password where username matches

		  		collection.updateOne({ username : user }
		    	, { $set: { password : req.body.password } }, function(err, result) {
		    	console.log("Updated the password of"+user);
		    	resetusername=false;
		    	user='';
		    	old_password='';
		    	login=0;

		    	res.redirect('/signin.ejs');
		    	callback(result);
		  		});  
			};


		  		
		   		updateDocument(db, function() {
		    	//MongoClient.close();
		  		});
	   	}
	   	else
	   	{
	   		res.redirect('/changepassword.ejs');
	   	}
  	// });


});


app.post('/', urlencodedparserhome, function(req,res){
	res.sendFile(__dirname+'/pages/success.html');

});

app.post('/signup.ejs', urlencodedparserhome, function(req,res){

	console.log(req.body);
	// Use connect method to connect to the server
	//MongoClient.connect(err => {
	  	//assert.equal(null, err);
	 	console.log("Connected successfully to server");
 
		const db = MongoClient.db(dbName);

		const findDocuments = function(db, callback) {
		 	// Get the documents collection
		  	const collection = db.collection('closedLoop');
		 	// Find some documents
		 	collection.find({'username': req.body.username}).toArray(function(err, docs) {
		    ////assert.equal(err, null);
		    console.log("Found the following records");
		    console.log(docs);
		   
		   	if(docs != null && docs.length > 0){
		   		usernameexists=true;
		    	res.redirect('/signup.ejs');
		    }
		    	else{
		    		
		    			const insertDocuments = function(db, callback) {
						  	// Get the documents collection
		 					const collection = db.collection('closedLoop');
						  	// Insert some documents
		 					collection.insertMany([{username:req.body.username,email:req.body.email,password:req.body.password,security_question:req.body.security_question,security_answer:req.body.security_answer}], function(err, result) {
		    				//assert.equal(err, null);
		    				assert.equal(1, result.result.n);
		    				assert.equal(1, result.ops.length);
		    				console.log("Inserted 1 documents into the collection");
		    				callback(result);
							});
						};

						insertDocuments(db, function() {
		    			//MongoClient.close();
						});
						//res.redirect('/signup/verifymail.html');
						loginagain=true;
						res.redirect('/signin.ejs');

		    		}

		    callback(docs);
			});
		};

		findDocuments(db, function() {
	    //MongoClient.close();
	  	});	
 
  ////MongoClient.close();
	// });


});

app.post('/signin.ejs', urlencodedparserhome, function(req,res){


	console.log(req.body);
	// Use connect method to connect to the server
	//MongoClient.connect(err => {
	  	//assert.equal(null, err);
	 	console.log("Connected successfully to server");
	 
		const db = MongoClient.db(dbName);

		const findDocuments = function(db, callback) {
		 	// Get the documents collection
		  	const collection = db.collection('closedLoop');
		 	// Find some documents
		 	collection.find({'username': req.body.username}).toArray(function(err, docs) {
			    ////assert.equal(err, null);
			    console.log("Found the following records");
			   
			   	if(docs != null && docs.length > 0){
			    	if(req.body.password===docs[0].password){
			    		console.log('login successful !');
			    		console.log('Your email is '+docs[0].email);
			    		user=docs[0].username;
			    		login=2;
			    		res.redirect('/');
			    	}
			    	else{
			    		console.log('invalid username/password');
			    		login=1;
			    		res.redirect('/signin.ejs');
			    	}
				}
				else{
					console.log('invalid username/password');
					login=1;
			    	res.redirect('/signin.ejs');
				}
			    callback(docs);
			});
		};

		findDocuments(db, function() {
	    //MongoClient.close();
	  	});
	 
	  ////MongoClient.close();
	// });

	

	
});

app.post('/signup/verifymail.html', urlencodedparserhome, function(req,res){
	res.redirect('/');

});

/*app.get('/signup',function(req,res){
  console.log('request made to'+req.url);
  res.sendFile('./pages/signup.html');
  
});*/

app.listen(3000);
console.log("listening to "+"//localhost:"+3000);
