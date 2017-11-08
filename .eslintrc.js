module.exports = {
    "env": {
       "browser": true,
  		"commonjs": true,
  		"es6": true,
  		"jquery": true
    },
    "globals": {
        "WUI": true,
        "google": false
    },
    "extends": "eslint:recommended",
    "rules": {
		"no-console": "off",
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
