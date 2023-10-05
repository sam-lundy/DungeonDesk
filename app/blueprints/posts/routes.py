from . import posts
from flask import jsonify, request
from app.models import db, Post, PostLike


@posts.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    return jsonify([{
        'id': post.id, 
        'username': post.username, 
        'content': post.content,
        'timestamp': post.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for post in posts])


@posts.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    if not data or 'content' not in data or 'username' not in data:
        return jsonify({'message': 'Invalid request', 'success': False}), 400

    post = Post(username=data['username'], content=data['content'])
    db.session.add(post)
    db.session.commit()

    return jsonify({'post': {'id': post.id, 'username': post.username, 'content': post.content}, 'success': True})


@posts.route('/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    user_id = request.json.get('user_id')
    value = request.json.get('value')
    
    existing_like = PostLike.query.filter_by(post_id=post_id, user_id=user_id).first()
    
    if existing_like:
        # If the user is toggling their previous choice, remove the record
        if existing_like.like_value == value:
            db.session.delete(existing_like)
        else:
            existing_like.like_value = value
    else:
        new_like = PostLike(post_id=post_id, user_id=user_id, like_value=value)
        db.session.add(new_like)
    
    db.session.commit()
    
    return jsonify({"success": True, "message": "Updated like/dislike status"})


@posts.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    post = Post.query.get(post_id)
    if post:
        db.session.delete(post)
        db.session.commit()
        return jsonify({"success": True, "message": "Post deleted"})
    return jsonify({"success": False, "message": "Post not found"}), 404
