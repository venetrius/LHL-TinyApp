# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs.

## Final Product

![&quot;screenshot description&quot;](#)
![&quot;screenshot description&quot;](#)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Behaviour


    GET /
        if user is logged in:     redirect to /urls
        if user is not logged in: redirect to /login

    GET /urls
        if user is logged in:
            returns HTML with:
            the site header
            a list of URLs the user has created, each list item containing:
            a link to "Create a New Short Link" which makes a GET request to /urls/new
        if user is not logged in:
            returns 401

    GET /urls/new
        if user is logged in:
            returns HTML with:
            the site header
            a form which contains:
                a text input field for the original (long) URL
                a submit button which makes a POST request to /urls
        if user is not logged in:
            redirects to the /login page

    GET /urls/:id
        if user is logged in and owns the URL for the given ID:
            returns HTML with:
            the site header
            the short URL (for the given ID)
            a form which contains:
                the corresponding long URL
                an update button which makes a POST request to /urls/:id
        if user is not logged in:
            returns 401
        if user is logged it but does not own the URL with the given ID or he given ID does not exis
            403

    GET /u/:id
        if URL for the given ID exists:
            redirects to the corresponding long URL
        if URL for the given ID does not exist:
            returns 404

    POST /urls
        if user is logged in:
            generates a short URL, saves it, and associates it with the user
            redirects to /urls/:id, where :id matches the ID of the newly saved URL
        if user is not logged in:
            returns 401

    POST /urls/:id
        if user is logged in and owns the URL for the given ID:
            updates the URL
            redirects to /urls
        if user is not logged in:
            returns 401
        if user is logged it but does not own the URL for the given ID:
            returns 403
    POST /urls/:id/delete
        if user is logged in and owns the URL for the given ID:
            deletes the URL
            redirects to /urls
        if user is not logged in:
            returns 401
        if user is logged it but does not own the URL for the given ID:
            returns 403

    GET /login
        if user is logged in:
            redirects to /urls
        if user is not logged in:
            returns HTML with:
            a form which contains:
                input fields for email and password
                submit button that makes a POST request to /login

    GET /register
        if user is logged in:
            redirects to /urls
        if user is not logged in:
            returns HTML with:
            a form which contains:
                input fields for email and password
                a register button that makes a POST request to /register

    POST /login
        if email and password params match an existing user:
            sets a cookie
            redirects to /urls
        if email and password params don't match an existing user:
            returns HTML with a relevant error message

    POST /register
        if email or password are empty:
            returns HTML with a relevant error message
        if email already exists:
            returns HTML with a relevant error message
        otherwise:
            creates a new user
            encrypts the new user's password with bcrypt
            sets a cookie
            redirects to /urls

    POST /logout
        deletes cookie
        redirects to /urls
