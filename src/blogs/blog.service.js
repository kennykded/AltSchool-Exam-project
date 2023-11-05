// const userModel = require('../models/user.model');
const blogModel = require('./../models/blog.model');



// New Blog Service
exports.createBlog = async (user, reqBody) => {
    try {
        // function to calculate reading time
        function readingTime (text){
            const words = text.split(/\s+/);
            const wordCount = words.length;
            let averageWPM = 200
            let calcSec
            let calcMin = wordCount / averageWPM

            if (calcMin < 1){
                calcSec = Math.floor(calcMin * 60);
                return `${calcSec}sec`
            }else {
                return `${calcMin}min`
            }
        }

        // console.log(user);
        // console.log({tags: [...reqBody.tags.split(',')]});

        const newBlog = await blogModel.create({
            title: reqBody.title,
            description: reqBody.description,
            body: reqBody.body,
            author: `${user.firstName} ${user.lastName}`,
            tags: [...reqBody.tags.split(',')],
            read_count: 0,
            reading_time: readingTime(reqBody.body),
            user_id: user._id
        });

        if (!newBlog) {
            return {
                statusCode: 404,
                message: 'Something went wrong while creating the blog. Click here to go home',
                blogs: null
            }
        }
        // console.log({newBlog});
        return {
            statusCode: 200,
            message: "Blog created successfully",
            blogs: newBlog
        }
    } catch (error) {
        // console.log(error);
        return {
            statusCode: 400,
            message: 'Something went wrong. Click here to go home',
            blogs: null
        }
    }
}


// Get all Blogs Service
exports.getBlogs = async () => {
    try {
        let blogs = await blogModel.find({state: 'published'});

        if (blogs.length == 0) {
            return {
                statusCode: 404,
                message: "No blogs published yet",
                blogs: null
            }
        }


        if (blogs.length != 0) {
            blogs = blogs.map((blog) => {
                let date = `${blog.time_published}`.split(/(?<=\d{4})\s/)[0].split(' ').slice(1);
                date.splice(1,1,`${date[1]},`)
                blog.published_time = date.join(' ');
    
                return blog
            })

            return {
                statusCode: 200,
                message: null,
                blogs
            }
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'Something went wrong while fecthing the blog',
            blogs: null
        }
    }
}


// Get Peersonal Blogs Service
exports.getPersonalBlogs = async (user) => {
    try {
        // Get blogs by user_id
        let myBlogs = await blogModel.find({user_id: user._id});

        
        if (myBlogs.length == 0){
            return {
                statusCode: 404,
                message: 'No published or saved blog yet',
                pubBlogs: null,
                // user
            }
        }


        
        // Published Blogs && Format Date
        const pubBlogs = myBlogs.filter((blog) => blog.state == 'published').map((blog) => {
            let date = `${blog.time_published}`.split(/(?<=\d{4})\s/)[0].split(' ').slice(1);
            date.splice(1,1,`${date[1]},`)
            blog.published_time = date.join(' ');

            return blog
        });
        // console.log('timestmp', pubBlogs.published_time);
        
        // Draft Blogs & Format Date
        let draftBlogs = myBlogs.filter((blog) => blog.state == 'draft').map((blog) => {
            let date = `${blog.createdAt}`.split(/(?<=\d{4})\s/)[0].split(' ').slice(1);
            date.splice(1,1,`${date[1]},`)
            blog.time_saved = date.join(' ');

            return blog
        })


        
        // console.log( 'timestamp for draft', draftBlogs.time_saved);
        

        if (pubBlogs.length == 0 || draftBlogs.length == 0) {
            return {
                statusCode: 404,
                message: 'No Blogs here',
                pubBlogs: (pubBlogs.length == 0 ? false : pubBlogs),
                draftBlogs: (draftBlogs.length == 0 ? false : draftBlogs)
            }
        }
        
        if (pubBlogs != 0 && draftBlogs != 0) {
            return {
                statusCode: 200,
                message: 'Blog fetched successfully',
                pubBlogs,
                draftBlogs
            }
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            message: 'Something went wrong while fecthing the blog',
            pubBlogs: (pubBlogs.length == 0 ? false : pubBlogs),
            draftBlogs: (draftBlogs.length == 0 ? false : draftBlogs)
        }
    }


}




// View Public Post
exports.viewPublicPost = async (title_blog_id) => {
    try {
        title_blog_id = title_blog_id.split('-');
        const blog_id = title_blog_id[title_blog_id.length -1];

        // Get Blog
        let blog = await blogModel.findOne({_id: blog_id});

        // console.log('timepublished', blog.time_published);

        // Format Date
        let date = `${blog.time_published}`.split(/(?<=\d{4})\s/)[0].split(' ').slice(1);
        date.splice(1,1,`${date[1]},`);
        blog.published_time = date.join(' ');

        if (!blog){
            return {
                statusCode: 404,
                message: 'Could not fetch blog',
            }
        }

        return {
            statusCode: 204,
            message: 'Blog fetched',
            blog: blog
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            message: 'Something went wrong while fecthing the blog',
        }
    }
}


// Search Public Post
exports.searchBlogs = async (query) => {
    try {
        // Query Database
        const matchedBlogs = await blogModel.find({
            $or: [
                {title: {$regex: query, $options: 'i'}},
                {author: {$regex: query, $options: 'i'}},
                {tags: {$elemMatch: {$regex: query, $options: 'i'}}}
            ]
        })

        // console.log(matchedBlogs);

        if (!matchedBlogs){
            return {
                statusCode: 400,
                message: 'Something went wrong while fecthing the blog',
                blogs: null
            }
        }

        if (matchedBlogs.length == 0){
            return {
                statusCode: 404,
                message: 'No blogs found',
                matchedBlogs: []
            }
        }

        if (matchedBlogs.length != 0){
            return {
                statusCode: 200,
                message: 'Search successful',
                matchedBlogs
            }
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            message: "Couldn't process request",
            matchedBlogs: null
        }
    }
}



// Update Blog Service
exports.updateBlog = async({user, blog_id, reqBody}) => {
    try {
        if (!reqBody) {
            return {
                statusCode: 422,
                message: 'Input a task'
            }
        }

        console.log('update req', reqBody);
        // Find Blog to update
        const updatedBlog = await blogModel.findOneAndUpdate({_id: blog_id}, {
            title: reqBody.title,
            description: reqBody.description,
            body: reqBody.body,
            tags: [...reqBody.tags.split(',')],
            reading_time: readingTime(reqBody.body),
            // user_id: user._id
        })

        // Function to Calculate the new Readng time
        function readingTime (text){
            const words = text.split(/\s+/);
            const wordCount = words.length;
            let averageWPM = 200
            let calcSec
            let calcMin = wordCount / averageWPM

            if (calcMin < 1){
                calcSec = Math.floor(calcMin * 60);
                return `${calcSec}sec`
            }else {
                return `${calcMin}min`
            }
        }

        // console.log('task to update', updatedBlog);

        if (!updatedBlog){
            return {
                statusCode: 406,
                message: 'Could not update blog',
            }
        }

        return {
            statusCode: 204,
            message: 'Blog updated Succefully',
            updatedBlog: updatedBlog,
            user
        }
    } catch (error) {
        console.log(error);
        return {
            statusCode: 400,
            message: 'Something went wrong. Click here to go home',
            blogs: null
        }
    }
}



// Delete Blog Service
exports.deleteBlog = async(blog_id) => {
    try {
        const delBlog = await blogModel.findOneAndDelete({_id: blog_id});
        // console.log(delBlog);

        if (!delBlog){
            return {
                statusCode: 404,
                message: 'Something went wrong. Couldn\'t delete post',
                blogs: null
            }
        }

        if (delBlog) {
            return {
                statusCode: 200,
                message: 'Successfully deleted',
                delBlog
            }
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'Something went wrong. Click here to go home',
            blogs: null
        }
    }
}
