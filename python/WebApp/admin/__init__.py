from flask import current_app as app, render_template, request, redirect, jsonify, url_for, Blueprint, \
    abort, render_template_string, send_file

admin = Blueprint('admin', __name__)


@admin.route('/admin', methods=['GET'])
def admin_view():
    return render_template("admin.html")
