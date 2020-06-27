## Capstone Project - Image Filtering App

### Features

- Login with Auth0 (user is authenticated to see only his/her images)
- Upload image (used request-validator-plugin)
- Apply selected filters to uploaded image (with Jimp - selected filter applied after uploading image. Therefore at first you can see original image, after refresh you can see the processed image. If you are not select any filter, original image directly uploaded to the bucket.) 
- Delete image
- Search in images with hashtags (Elasticsearch - with character limit)

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

#### Screenshot

The ss of the project is added to /other/screenshots folder.