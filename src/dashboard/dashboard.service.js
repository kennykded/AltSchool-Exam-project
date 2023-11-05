const blogModel = require('../models/blog.model');


exports.getDraftPost = async (blog_id) => {
    try {
        // Get blogs by user_id
        let draftBlog = await blogModel.findOne({_id: blog_id});


        // Format Date
        let date = `${draftBlog.createdAt}`.split(/(?<=\d{4})\s/)[0].split(' ').slice(1);
        date.splice(1,1,`${date[1]},`);
        draftBlog.time_saved = date.join(' ');
        
        
        if (!draftBlog){
            return {
                statusCode: 404,
                message: 'Something went wrong while fecthing the post',
            }
        }

        return {
            statusCode: 200,
            message: 'successful',
            draftBlog
        }
    } catch (error) {
        console.log('Draft error', error);
        return {
            statusCode: 400,
            message: 'Something went wrong while fecthing the post',
        }
    }
}


// Service to Publish Post 
exports.publishPost = async(blog_id) => {
    try {
        // Get post to publish
        let pubBlog = await blogModel.findOneAndUpdate({_id: blog_id}, {
            state: 'published',
            time_published: Date()
        });

        if (!pubBlog) {
            return {
                statusCode: 404,
                message: 'Something went wrong while publishing. Try again leter ',
            }
        }

        // console.log('published', pubBlog);
        
        return {
            statusCode: 200,
            message: 'successful',
            pubBlog
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'Something went wrong while publishing. Try again later',
        }
    }
}


// Service to View Published Post
exports.viewPublishedPost = async(blog_id) => {
    try {
        // Get blogs by user_id
        let pubBlog = await blogModel.findOne({_id: blog_id});


        // Format Date
        let date = `${pubBlog.time_published}`.split(/(?<=\d{4})\s/)[0].split(' ').slice(1);
        date.splice(1,1,`${date[1]},`);
        pubBlog.published_time = date.join(' ');
        
        // console.log('view published blog', pubBlog);
        
        if (!pubBlog){
            return {
                statusCode: 404,
                message: 'Something went wrong while fecthing the post',
            }
        }

        return {
            statusCode: 200,
            message: 'successful',
            pubBlog
        }
    } catch (error) {
        return {
            statusCode: 400,
            message: 'Something went wrong while publishing. Try again later',
        }
    }
}
