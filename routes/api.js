/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
//const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {

  app.route('/api/books')
    .get(function (req, res){
        let objFind = {};
        if (!req.query._id) {
          console.log('GET ALL');
          db.collection('books').find(objFind).toArray((err, data) => {
           if(err) {
            console.log(err+' Error occurred while find');
           }
            let respData = data.map(item => {return {_id: item._id, title: item.title,
                                    commentcount: (item.comments)?item.comments.length:0};});
            //console.log(respData);
          return res.json(respData);          
          });
        }
        else 
        {
          console.log('GET ONE');
          objFind._id = ObjectId(req.query._id);
          db.collection('books').find({_id: objFind}).toArray( (err, data) => {
              console.log('FindOne');
             if(err) {
              console.log(err+' Error occurred while find');
             }
            if(!data)
              return res.send('id is not in db');
            return res.json(data);
          console.log(':('+data);
            //return res.json(data);          
        });

          
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        }
    })
    
    .post(function (req, res){
      
    console.log(req.body);
      //response will contain new book object including atleast _id and title
    console.log('POST');
      if(!req.body.title)
        return res.send('empty title');
      var title = req.body.title;
      db.collection('books').insert({title, comments: []}, (err, resp) => {
           if(err) {
            console.log(err+' Error occurred while inserting');
           }
        console.log(resp.ops[0]);
          return res.json(resp.ops[0]);
        });
    })
    
    .delete(function(req, res){
    console.log('DELETE ALL');
      //if successful response will be 'complete delete successful'
      db.collection('books').remove({},(err,resp) => {
         if(err) {
          console.log(err+' Error occurred while deleting');
          return res.send( 'failed: could not delete ');
         }  
        if (resp.result.n === 0)
          return res.send('failed: could not delete ');
        console.log('complete delete successful');  

        return res.send( 'complete delete successful');          
      });    
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    console.log('GET :ID '+bookid);
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('books').findOne({_id: ObjectId(bookid) },(err, data) => {
       if(err) {
        console.log(err+' Error occurred while find');
       }
        if( !data)
          return res.send('id is not in db');
          //return res.send('no book exists');
        console.log(data);
        return res.json(data);          
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      if (comment == '')
        req.send('No comment');
      //json res format same as .get
      db.collection('books').findOneAndUpdate({_id: ObjectId(bookid)},{ $push: { comments: comment} },
                                              { returnOriginal : false}, (err, data) => {
        if(err) {
        console.log(err+' Error occurred while updating');
          return res.send( 'could not update ' + req.body._id);
        }
        console.log(data);
        return res.json(data.value);        
      });
    })
    
      //if successful response will be 'delete successful'
    .delete(function(req, res){
      var bookid = req.params.id;
      if(!ObjectId.isValid(bookid)|| bookid == '')
        return res.send('invalid id');
    console.log('DELETE '+req.params.id);
        db.collection('books').remove({_id: ObjectId(bookid)},(err,resp) => {
           if(err) {
            console.log(err+' Error occurred while deleting');
            return res.send( 'failed: could not delete ');
           }  
          if (resp.result.n === 0)
            return res.send('failed: could not delete ');
          console.log('deleted one');
          return res.send( 'delete successful');          
        });    
    });
  
};
