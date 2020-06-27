## Capstone Project - Image Filtering App

### Features

- Login with Auth0 (user is authenticated to see only his/her images)
- Upload image
- Apply selected filters to uploaded image (with Jimp) 
- Delete image
- Search in images with hashtags (with character limit)

### How to run the application

#### Backend

```
cd backend
npm install
sls deploy -v
```

#### Frontend

Required parameters alredy set in config.ts file.

```
cd client
npm install
npm run start
```

#### Postman collection

https://www.getpostman.com/collections/3f243b08306b75c4a5cc