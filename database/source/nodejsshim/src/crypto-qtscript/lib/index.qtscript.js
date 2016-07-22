/**
 * Emulate Node.js's crypto module using Qt's QCryptographicHash class.
 * Currently, only `crypto.createHash(algorithm)` and `Class: Hash` are implemented.
 *
 * TODO: Support more crypto functions.
 *
 * @See: https://nodejs.org/dist/latest-v4.x/docs/api/crypto.html
 * @See: https://doc.qt.io/qt-5/qcryptographichash.html
 *
 * @type {{createHash: Function, Hash: Function}}
 */
var crypto = {

  /**
   * @param {String} algorithm - Algorithm is dependent on the available algorithms
   *   supported by the version of Qt's QCryptographicHash class. Examples are:
   *   'md4', 'md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'sha3_224',
   *   'sha3_256', 'sha3_384', 'sha3_512'
   */
  createHash: function createHash (algorithm) {
    return new this.Hash(algorithm);
  },

  /**
   * The class for creating hash digests of data. Returned by crypto.createHash.
   *
   * @param {String} algorithm - Algorithm is dependent on the available algorithms
   *   supported by the version of Qt's QCryptographicHash class. Examples are:
   *   'md4', 'md5', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512', 'sha3_224',
   *   'sha3_256', 'sha3_384', 'sha3_512'
   * @return {Hash} - The Hash object.
   * @constructor
   */
  Hash: function Hash (algorithm) {
    this.QtAlgorithm = _mapNodeAlgorithmToQt(algorithm);
    this.QCryptographicHash = new QCryptographicHash(this.QtAlgorithm);
    this.input_encoding = 'binary';
    this.encoding = 'buffer';

    return this;
  }
};

/**
 * Emulate Node.js's `hash.update(data[, input_encoding])` method.
 * @See: https://nodejs.org/dist/latest-v4.x/docs/api/crypto.html#crypto_hash_update_data_input_encoding
 *
 * @param {String | Buffer} data - The data to hash.
 * @param {String} [input_encoding] - The encoding given can be 'utf8', 'ascii' or 'binary'.
 * @return {Hash} - The Hash object.
 */
crypto.Hash.prototype.update = function update (data, input_encoding) {
  // TODO: Support encoding?
  this.input_encoding = (input_encoding ? input_encoding : this.input_encoding);

  var qba = _convertEncodingToQByteArray(data, this.input_encoding);

  this.QCryptographicHash.addData(qba);

  return this;
};

/**
 * Emulate Node.js's `hash.digest([encoding])` method.
 * @See: https://nodejs.org/dist/latest-v4.x/docs/api/crypto.html#crypto_hmac_digest_encoding
 *
 * @param {String} [encoding] - The encoding can be 'hex', 'binary' or 'base64'.
 * @return {String} - The hash string.
 */
crypto.Hash.prototype.digest = function digest (encoding) {
  // TODO: Support encoding?
  this.encoding = (encoding ? encoding : this.encoding);

  var qba = this.QCryptographicHash.result();
  return _convertQByteArrayToEncoding(qba, this.encoding);
};

/**
 * Helper function to convert the hash's encoded data to a Qt QByteArray.
 *
 * @param {String | Buffer} data - The data to hash. If data is a Buffer then encoding is ignored.
 * @param {String} [encoding] - The encoding given can be 'utf8', 'ascii' or 'binary'.
 *   If no encoding is provided, and the input is a string, an encoding of 'binary' is enforced.
 * @return {QByteArray | Boolean} - A QByteArray of the data.
 * @private
 */
var _convertEncodingToQByteArray = function _convertEncodingToQByteArray (data, encoding) {
  var qba;
  if (Buffer.isBuffer(data)) {
    if (data.QByteArray) {
      //qba = new QByteArray(data.QByteArray);
      qba = data.QByteArray;
    } else {
      qba = new QByteArray(data.length, 0);
      var size = data.length;
      for (var i = 0; i < size; i++) {
        qba.replace(i, 1, QByteArray(1, data[i]));
      }
    }
  } else {
    switch (encoding) {
      // TODO: Do we need to do any conversion?
      case 'ascii':
      case 'binary':
      case 'utf8':
        qba = new QByteArray(data);
        break;
      default:
        if (typeof data === 'string') {
          // Node.js's default is 'binary'.
          qba = _convertEncodingToQByteArray (data, 'binary')
        } else {
          return false;
        }
    }
  }

  return qba;
};

/**
 * Helper function to convert a Qt QByteArray to the digest encoding.
 *
 * @param {QByteArray} qba - The QByteArray to convert.
 * @param {String} [encoding] - The encoding can be 'hex', 'binary' or 'base64'.
 *   If no encoding is provided, then a buffer is returned.
 * @return {String | Buffer} - The encoded QByteArray data.
 * @private
 */
var _convertQByteArrayToEncoding = function _convertQByteArrayToEncoding (qba, encoding) {
  var data;
  switch (encoding) {
    case 'base64':
      data = qba.toBase64();
      break;
    case 'binary':
      data = qba.toString();
      break;
    case 'hex':
      data = qba.toHex();
      break;
    default:
      // Node.js's default is a Buffer.
      if (Buffer.fromQByteArray) {
        data = Buffer.fromQByteArray(qba);
      } else {
        var buffer = new Buffer(qba.size());
        var mask = (1 << 8) -1;
        // HEX conversion is slower.
        //var hex = qba.toHex().toString();
        //buffer.write(hex, "hex");
        var size = qba.size();
        for (var i = 0; i < size; i++) {
          buffer[i] = qba.at(i) & mask;
        }
        data = buffer;
      }
  }

  return data;
};

/**
 * Maps Node.js's algorithm string to Qt's `enum QCryptographicHash::Algorithm`.
 * Require's Qt's QCryptographicHash object being exposed to Qt Script.
 *
 * @See: https://doc.qt.io/qt-5/qcryptographichash.html#Algorithm-enum
 * @See: https://nodejs.org/dist/latest-v4.x/docs/api/crypto.html#crypto_crypto_createhash_algorithm
 *
 * @param {String} algorithm - The algorithm parameter supplied to
 *   `crypto.createHash(algorithm)`
 * @return {Number} - The Qt matching `enum QCryptographicHash::Algorithm`.
 */
var _mapNodeAlgorithmToQt = function _mapNodeAlgorithmToQt (algorithm) {
  switch (algorithm) {
    case 'md4':
      return QCryptographicHash.Md4;
    case 'md5':
      return QCryptographicHash.Md5;
    case 'sha1':
      return QCryptographicHash.Sha1;
    case 'sha224':
      return QCryptographicHash.Sha224;
    case 'sha256':
      return QCryptographicHash.Sha256;
    case 'sha384':
      return QCryptographicHash.Sha384;
    case 'sha512':
      return QCryptographicHash.Sha512;
    case 'sha3_224':
      return QCryptographicHash.Sha3_224;
    case 'sha3_256':
      return QCryptographicHash.Sha3_256;
    case 'sha3_384':
      return QCryptographicHash.Sha3_384;
    case 'sha3_512':
      return QCryptographicHash.Sha3_512;
    default:
      return false;
  }
};

module.exports = crypto;
