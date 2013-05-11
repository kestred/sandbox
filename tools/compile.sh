# Make sure we are within the git repository
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get root of Git repository and set it as the working directory
GIT_DIR="$(git rev-parse --show-toplevel)"
cd $GIT_DIR

# Remove previous build
if [ $1 == "clean" ]; then
	rm -rf build
fi

# Migrate raw files
mkdir build
cp src/client-core/core.html build/client.html
cp -r src/client-core/vendor build/vendor
cp -r src/client-core/img build/img
cp -r src/server-core/* build/

# Compile Javascript and CSS
java -jar tools/Closure/compiler.jar \
	--js tools/Closure/externs/jquery-1.9.js \
	--js src/client-core/base.js \
	--js src/client-core/rtc.js \
	--js_output_file build/core.js
java -jar tools/Closure/stylesheets.jar \
	--output-file build/core.css \
	src/client-core/base.css
