from app import app

if __name__ == "__main__":
    print("Starting SafeRoute Server...")
    app.run(
        host=app.config["HOST"],
        port=app.config["PORT"],
        debug=app.config["DEBUG"],
    )
