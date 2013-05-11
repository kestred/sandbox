# Make sure we are within the git repository
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get root of Git repository and set it as the working directory
GIT_DIR="$(git rev-parse --show-toplevel)"
cd $GIT_DIR

# Parse arguments
autorun="false"
debugMode="false"
while [ "$1" != "" ]; do
    case $1 in
      "-c" | "--clean")
        rm -rf build
        ;;
      "-d" | "--debug")
        debugMode="true"
        ;;
      "-py" | "--python")
        pyServer="true"
        ;;
      "-js" | "--javascript")
        jsServer="true"
        ;;
      "-R" | "--autorun")
        autorun="true"
        ;;
    esac
    shift
done
if [ -z "$jsServer" ]; then
	if [ -z "$pyServer" ]; then
		jsServer="true"
		pyServer="false"
	else
		jsServer="false"
	fi
fi

# Create build directory
if [ ! -d "build" ]; then
    mkdir build
fi

# Migrate raw files
cp src/client-core/core.html build/client.html
cp -r src/client-core/vendor build/vendor
cp -r src/client-core/img build/img
if [ $pyServer == "true" ]; then
	cp -r src/client-core/socket.io build/socket.io
    cp src/server-core/*.py build/
fi

# Compile CSS and Javascript
java -jar tools/Closure/stylesheets.jar \
    --output-file build/core.css \
    src/client-core/base.css
if [ $debugMode == "true" ]; then
    cat src/client-core/base.js \
		src/client-core/rtc.js \
     >> build/core.js
else
	java -jar tools/Closure/compiler.jar \
		--js tools/Closure/externs/jquery-1.9.js \
		--js src/client-core/base.js \
		--js src/client-core/rtc.js \
		--js_output_file build/core.js
fi
if [ $jsServer == "true" ]; then
    cat src/server-core/base.js \
        src/server-core/rtc.js \
     >> build/server.js
fi

# Run server
if [ $autorun = "true" ]; then
	if [ $jsServer == "true" ]; then
		node build/server.js
	elif [ $pyServer == "true" ]; then
		python build/server.py
	fi
fi
