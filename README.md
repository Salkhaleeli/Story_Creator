## Story Creator

A Full-Stack app that allows registered users to create and post short stories. Other logged in users may add contributions to a short story which the owner of that story can review and choose which contribution they want to append to their story.

## Screenshots

### Home page

!["screenshot description"](https://github.com/Salkhaleeli/Story_Creator/blob/master/docs/gif/Home.gif)


### Log-in page

!["screenshot description"](https://github.com/Salkhaleeli/Story_Creator/blob/master/docs/gif/Log-in-page.gif)

### Register page

!["screenshot description"](https://github.com/Salkhaleeli/Story_Creator/blob/master/docs/gif/Register-user.gif)

### Create story page

!["screenshot description"](https://github.com/Salkhaleeli/Story_Creator/blob/master/docs/gif/Create-stories.gif)

### Stories page

!["screenshot description"](https://github.com/Salkhaleeli/Story_Creator/blob/master/docs/gif/Stories-page.gif)

### Extra features

!["screenshot description"](https://github.com/Salkhaleeli/Story_Creator/blob/master/docs/gif/Extra-feature.gif)


## Getting Started

1. Create the `.env` by using `.env.example` as a reference: `cp .env.example .env`
2. Update the .env file with your correct local information

- username: `labber`
- password: `labber`
- database: `midterm`

3. Install dependencies: `npm i`
4. Fix to binaries for sass: `npm rebuild node-sass`
5. Reset database: `npm run db:reset`

- Check the db folder to see what gets created and seeded in the SDB

7. Run the server: `npm run local`

- Note: nodemon is used, so you should not have to restart your server

8. Visit `http://localhost:8080/`

## Warnings & Tips
- Split database schema (table definitions) and seeds (inserts) into separate files, one per table. See `db` folder for pre-populated examples.
- Use the `npm run db:reset` command each time there is a change to the database schema or seeds.
  - It runs through each of the files, in order, and executes them against the database.
  - Note: you will lose all newly created (test) data each time this is run, since the schema files will tend to `DROP` the tables and recreate them.

## Dependencies

- Node 10.x or above
- NPM 5.x or above
- PG 6.x
