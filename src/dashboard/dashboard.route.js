const router = require('express').Router();
const blogService = require('../blogs/blog.service');
const dashboardService = require('./dashboard.service');
const cookieParser = require('cookie-parser');
const auth = require('../auth/globalAuth');

router.use(cookieParser());



// Protected Routes
router.use(auth.cookieAuth)


// Display Personal Blogs (published) on dashboard
router.get('/@:name', async (req, res) => {
    const user = res.locals.user;

    const response = await blogService.getPersonalBlogs(user);

    if (response.statusCode == 404){
        // console.log('bug', response.draftBlogs);
        res.render('dashboard', {message: response.message, pubBlogs: response.pubBlogs, draftBlogs: response.draftBlogs, user})
    } else if (response.statusCode == 400){
        res.redirect('/404')
    }else{
        // console.log(user);
        res.render('dashboard', {message: response.message, pubBlogs: response.pubBlogs, draftBlogs: response.draftBlogs, user})
    }
});


// Display Draft Post
router.get('/@:name/:id/draft', async(req, res) => {
    const user = res.locals.user;
    const blog_id = req.params.id;

    // console.log('draft', user);

    const response = await dashboardService.getDraftPost(blog_id);

    if (response.statusCode == 404){
        // console.log('bug', response.draftBlogs);
        res.render('dashboard', {message: response.message, user})
    } else if (response.statusCode == 400){
        res.redirect('/404')
    }else{
        // console.log('res.draft', response.draftBlog);
        res.render('draftBlog', {blog: response.draftBlog, user})
    }

})


// Publish a post
router.get('/@:name/:id/publish', async(req, res) => {
    const user = res.locals.user;
    const blog_id = req.params.id

    // console.log('pub', user);

    const response = await dashboardService.publishPost(blog_id);

    if (response.statusCode == 404){
        // console.log('bug', response.draftBlogs);
        res.render('dashboard', {message: response.message, user})
    } else if (response.statusCode == 400){
        res.redirect('/404')
    }else{
        // console.log('res.draft', response.draftBlog);
        res.redirect(`/dashboard/@${user.email.split('@')[0]}`)
    }
})


// View Published Post
router.get('/@:name/:id', async(req, res) => {
    const user = res.locals.user;
    const blog_id = req.params.id

    // console.log('pub', user);

    const response = await dashboardService.publishPost(blog_id);

    if (response.statusCode == 404){
        // console.log('bug', response.draftBlogs);
        res.render('dashboard', {message: response.message, user})
    } else if (response.statusCode == 400){
        res.redirect('/404')
    }else{
        console.log(response.pubBlog.published_time);
        res.render(`fullBlog`, {blog: response.pubBlog})
    }
})





module.exports = router;