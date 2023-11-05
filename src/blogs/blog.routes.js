const blogModel = require('../models/blog.model');
const userModel = require('../models/user.model')
const router = require('express').Router();
const blogService = require('./blog.service');
const cookieParser = require('cookie-parser');
const auth = require('./../auth/globalAuth');

router.use(cookieParser());



// subRoute to view Public posts
router.get('/:user_id/:blog_id', async(req, res) => {
    const user_id = req.params.user_id
    const blog_id = req.params.blog_id;

    // Get Author's Email
    const userDetails = await userModel.findOne({_id: user_id});


    // Get the Blog && Update Read count
    const blog = await blogModel.findOne({_id: blog_id});
    blog.read_count = blog.read_count + 1
    
    // Save back to the database
    await blog.save()

    // console.log('read_count', blog);

    let blogName = blog.title.split(" ").join('-')

    res.redirect(`/@${userDetails.email.split('@')[0]}/${blogName}-${blog_id}`)
})



// Protected Routes --------------------------------------
router.use(auth.cookieAuth)


// Write a new story
router.post('/new-story', async (req, res) => {
    const user = res.locals.user;
    const reqBody = req.body;

    // console.log('owner', user);
    // console.log('blog', reqBody);

    const response = await blogService.createBlog(user, reqBody);

    if (response.statusCode == 404){
        res.render('landPage', {message: response.message, blogs: response.blogs})
    } else if (response.statusCode == 400){
        res.redirect('/404')
    }else{

        res.redirect(`/dashboard/@${user.email.split('@')[0]}`)
    }
})




// Update blogs ------------------
router.post('/@:name/:id/update', async (req, res) => {
    const user = res.locals.user;
    const blog_id = req.params.id;
    const reqBody = req.body;

    const response = await blogService.updateBlog({user, blog_id, reqBody});

    if (response.statusCode == 406){
        res.render('landPage', {message: response.message, blogs: response.blogs})
    } else if (response.statusCode == 400){
        res.redirect('/404')
    }else{

        res.redirect(`/dashboard/@${user.email.split('@')[0]}`)
        // res.redirect(`/dashboard/@${user.email.split('@')[0]}`)
    }

})


// Delete Blogs ------------------
router.get('/@:name/:id/delete', async(req, res) => {
    const user = res.locals.user;
    const blog_id = req.params.id;

    const response = await blogService.deleteBlog(blog_id);

    if (response.statusCode == 404){
        res.render('landPage', {message: response.message, blogs: response.blogs})
    } else if (response.statusCode == 400){
        res.redirect('/404')
    }else{

        res.redirect(`/dashboard/@${user.email.split('@')[0]}`)
    }
})

module.exports = router;
