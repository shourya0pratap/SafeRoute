from app import app

if __name__ == '__main__':
    # debug=True means the server will automatically update if you change code!
    # port=5000 is standard for Flask apps
    print("Starting SafeRoute Local Server...")
    app.run(debug=True, port=5000)