require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express')
const passport = require('passport')
const session = require('express-session')
const GitHubStrategy = require('passport-github2').Strategy
const cors = require("cors")

//documents I need to make and export through
const mongodb = require('./db/connect')  //install mongodb and dotenv
const swaggerDocument = require('./swagger.json')

const port = process.env.PORT || 4020
const app = express()

app.use(bodyParser.json())
   .use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true,
   }))
   .use(passport.initialize())
   .use(passport.session())
   .use(cors({origin:'*'}))
   .use(cors({methods: ['GET', 'POST','PUT','PATCH']}))
   .use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Orgin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Orgin, X-Requested-With, Content-Type, Accept, Z-Key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
   })

passport.use(new GitHubStrategy({
 clientID : process.env.GITHUB_CLIENT_ID,
 clientSecret : process.env.GITHUB_CLIENT_SECRET,
 callbackURL : process.env.CALLBACK_URL,
},

async function(accessToken, refreshToken, profile, done){
    try{
        const db = require('./db/connect').getDb();

        let user = await db.collection('user').findOne({githubId:profile.id})

        if(!user){
            const newUser = {
                githubId: profile.id,
                username: profile.username,
                email: profile.emails?.[0]?.value,
                createdAt: new Date()
            }
            const result = await db.collection('user').insertOne(newUser)
            newUser.isFirstLogin = true;
            user = newUser
        } else {
            user.isFirstLogin = false
        }
        return done(null,user)
    }
    catch (err) {
        return done(err, null)
    }
}))

passport.serializeUser((user,done) => {
 done(null,user)
})
passport.deserializeUser((user,done) => {
    done(null,user)
})

app.get('/', (req,res) => {
  const user = req.session.user
  res.send(req.session.user !== undefined ? 
    `logged in as ${user.username || user.displayName || "Unknown User"}` : 'Logged Out')})
app.get('/github', passport.authenticate('github'))

app.get('/github/callback', passport.authenticate('github', {
      failureRedirect: '/api-docs'}),
      (req, res) => {
        req.session.user = req.user

        if (req.user.isFirstLogin){
            return res.redirect('/api-docs/#/default/post_users_info')
        }

        res.redirect('/')
      }
    )

//routes instilation
mongodb.initDb((err) => {
    if(err){console.log(err)}
    else{
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
        .use('/', require('./routes'))
        .listen(port)
        console.log(`connected to DB and listening at http://localhost:${port}`)
    }
})