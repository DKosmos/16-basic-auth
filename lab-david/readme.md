# cfgram

## AKA Instagram clone

### .env variables
- PORT
- APP_SECRET
- MONGODB_URI

### Routes
#### Sign up / Sign in

- `POST: /api/signup { username, email, password }` creates a new user with provided username email and password.
- `GET: /api/signin` allows sign in with basic authentication header with username:password. 

#### Photo Album

- `POST: /api/photoalbum { name, desc }` creates a new photo album with provided name and description.
- `GET: /api/photoalbum/:photoalbumId` returns photo album with associated photoalbumId.
- `PUT: /api/photoalbum/:photoalbumId { name, desc }` updates photo album associated with photoalbumId with provided key: values.
- `DELETE: /api/photoalbum/:photoalbumId` deletes photo album associated with photoalbumId