#!/bin/bash

set -e

gulp lint
gulp build

karma start karma.conf.js --single-run --browsers Firefox

