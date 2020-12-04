const { MongoClient } = require('mongodb');
const express = require('express');

const app = express();

const url = 'mongodb://localhost:27017';
const dbName = 'Listy';

const client = new MongoClient(url);

client.connect((error) => {
  if (error) {
    console.log(error);
    process.exit(1); // Exit if connecion fails
  }
  // Connection successful
  console.log('Connection worked');

  // Get references to db and collection
  const db = client.db(dbName);
  const userCollection = db.collection('users');        // Users collection
  const listingCollection = db.collection('listings');  // Listings collection
  const inquiryCollection = db.collection('inquiries'); // Inquiries collection
  const imageCollection = db.collection('images');      // Images collection

  // Login endpoint
  app.get('/logIn', (req, res) => {
    const matcher = {
      userName: req.query.userName,
      password: req.query.password,
    };
    userCollection.findOne(matcher)
      .then((result) => {
        if (result) {
          return res.send({
            success: true,
          });
        }
        return res.send({
          success: false,
          error: 'Username or password invalid',
        });
      })
      .catch((e) => {
        console.log(e);
        res.send('Failed');
      })
  });

  // Register endpoint, might have to be post not get
  app.get('/register', (req, res) => {
    if (!req.query.userName || !req.query.password) {
      return res.send('Username and password must be entered');
    }
    const matcher = {
      userName: req.query.userName,
    };
    userCollection.findOne(matcher)
      .then((result) => {
        if (result) {
          // Manually reject promise (throw)
          // Jump to next catch, skip all .then's
          return Promise.reject('Sorry username already taken');
          // Promise.resolve(); - Manually trigger sucess
        }
        // res.send('TODO: Make user')
        const newUser = {
          userName: req.query.userName,
          password: req.query.password,
        };
        // Insert is also async, does not happen instantly
        return userCollection.insertOne(newUser); // Chain a promise

      })
      .then((result) => {
        // User has been inserted
        res.send('User has been inserted');
      })
      .catch((e) => {
        console.log(e);
        res.send(e);
      })

  });

  // Get listings endpoint
  app.get('/getListings', (req, res) => {
    // Network call
    listingCollection.find({})
      .toArray() // Convert documents found to JS array
      .then((listings) => {
        res.send(listings);
      })
      .catch((e) => {
        console.log(e);
        res.send('Failed');
      })
  });

  // Post listing endpoint, might have to be post not get
  app.get('/postListing', (req, res) => {
    if (!req.query.userName || !req.query.password) {
      return res.send('Username and password must be entered');
    }
    const listingMatcher = {
      lisitngID: req.query.id,
    };

    listingCollection.findOne(listingMatcher)
      .then((result) => {
        if (result) {
          return Promise.reject('Listing already exists');
        }
        const newListing = {
          lisitngID: req.query.id,
          listingTitle: req.query.title,
          listingType: req.query.type,
          listingDescription: req.query.description,
          listingPrice: req.query.price,
        };
        // Insert is also async, does not happen instantly
        return listingCollection.insertOne(newListing); // Chain a promise

      })
      .then((result) => {
        // Listing has been inserted
        res.send('Listing has been inserted');
      })
      .catch((e) => {
        console.log(e);
        res.send(e);
      })
  });

    // Get inquiries endpoint
    app.get('/getInquiries', (req, res) => {
      // Network call
      inquiryCollection.find({})
        .toArray() // Convert documents found to JS array
        .then((inquiries) => {
          res.send(inquiries);
        })
        .catch((e) => {
          console.log(e);
          res.send('Failed');
        })
    });

    // Post inquiry, might have to be post not get
    app.get('/postInquiry', (req, res) => {
      const inquiry = {
        inquiryID: req.query.id,
        inquiryMessage: req.query.message,
      };
  
      inquiryCollection.insertOne(inquiry)
        .then(() => {
          // Inquiry has been inserted
          res.send('Inquiry has been inserted');
        })
        .catch((e) => {
          console.log(e);
          res.send(e);
        })
    });

    // Get images endpoint
    // ASSUMING: Images have been processed and inserted into mongo collection
    app.get('/getImages', (req, res) => {
      // Network call
      imageCollection.find({})
        .toArray() // Convert documents found to JS array
        .then((images) => {
          res.send(images);
        })
        .catch((e) => {
          console.log(e);
          res.send('Failed');
        })
    });

    // Post image endpoint, might have to be post not get
    // ASSUMING: Images have been processed then sent to the endpoint
    app.get('/postImage', (req, res) => {
      const processedImage = {
        imageID: req.query.id,            // This would be the ID of the listing the image belongs to
        imageData: req.query.image,       // This should(?) be the processed image data in base64
      };
  
      imageCollection.insertOne(prcessedImage)
        .then(() => {
          // Image has been inserted
          res.send('Image has been inserted');
        })
        .catch((e) => {
          console.log(e);
          res.send(e);
        })
    });

  app.listen(4000, () => console.log('App listening on port 4000'));
});