--DO NOT EDIT THIS FILE! This file is generated by running the 'npm run build' command from this repos root. 
SELECT nodejsshim.npm_install('nodejsshim'::text, 'fs'::text, '1.0.0-rc'::text, 'https://github.com/xtuple/qt-script-node-js-shims'::text, $code_body$ 
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"fs":[function(require,module,exports){
// This is a stub for the `fs` module. It doesn't do anything right now, but
// can be used with `require('fs');` if something else needs `fs` to exist.

// TODO: Use QDir, QFile to emulate Node.js's `fs` module.
// @See: https://nodejs.org/dist/latest-v4.x/docs/api/fs.html
var fs = {
  // Classes
  FSWatcher: null,
  ReadStream: null,
  Stats: null,
  WriteStream: null,

  // Methods
  access: undefined,
  accessSync: undefined,
  appendFile: undefined,
  appendFileSync: undefined,
  chmod: undefined,
  chmodSync: undefined,
  chown: undefined,
  chownSync: undefined,
  close: undefined,
  closeSync: undefined,
  createReadStream: undefined,
  createWriteStream: undefined,
  exists: undefined,
  existsSync: undefined,
  fchmod: undefined,
  fchmodSync: undefined,
  fchown: undefined,
  fchownSync: undefined,
  fdatasync: undefined,
  fdatasyncSync: undefined,
  fstat: undefined,
  fstatSync: undefined,
  fsync: undefined,
  fsyncSync: undefined,
  ftruncate: undefined,
  ftruncateSync: undefined,
  futimes: undefined,
  futimesSync: undefined,
  lchmod: undefined,
  lchmodSync: undefined,
  lchown: undefined,
  lchownSync: undefined,
  link: undefined,
  linkSync: undefined,
  lstat: undefined,
  lstatSync: undefined,
  mkdir: undefined,
  mkdirSync: undefined,
  open: undefined,
  openSync: undefined,
  read: undefined,
  readdir: undefined,
  readdirSync: undefined,
  readFile: undefined,
  readFileSync: undefined,
  readlink: undefined,
  readlinkSync: undefined,
  realpath: undefined,
  readSync: undefined,
  realpathSync: undefined,
  rename: undefined,
  renameSync: undefined,
  rmdir: undefined,
  rmdirSync: undefined,
  stat: undefined,
  statSync: undefined,
  symlink: undefined,
  symlinkSync: undefined,
  truncate: undefined,
  truncateSync: undefined,
  unlink: undefined,
  unlinkSync: undefined,
  unwatchFile: undefined,
  utimes: undefined,
  utimesSync: undefined,
  watch: undefined,
  watchFile: undefined,
  write: undefined,
  writeFile: undefined,
  writeFileSync: undefined,
  writeSync: undefined
};

module.exports = fs;

},{}]},{},[]); 
$code_body$::text); 
