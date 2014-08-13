/**
 * Copyright 2014 Francesco Camarlinghi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var toString = {}.toString,
    indexOf = ''.indexOf;

// ECMA Language extensions
/**
 * Executes the provided callback function once for each element present in
 * the array. callback is invoked only for indexes of the array which have
 * assigned values; it is not invoked for indexes which have been deleted or
 * which have never been assigned values.
 * @param   {Function} callback     Callback function. It is bound to context and invoked
 *                                  with three arguments (element, index, array).
 * @param   {Any} [context]         Callback function context.
 */
Array.prototype.forEach = Array.prototype.forEach || function (callback /*, context */)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    if (this === void 0 || this === null)
        throw new TypeError('"this" is null or not defined.');

    var t = Object(this),
        n = t.length >>> 0;

    if (typeof callback !== "function")
        throw new TypeError('callback must be a function.');

    var context = arguments.length >= 2 ? arguments[1] : void 0;

    for (var i = 0; i < n; i++)
    {
        if (i in t)
            callback.call(context, t[i], i, t);
    }
};

/**
 * Executes the provided callback function once for each element present in
 * the array until it finds one where callback returns a falsy value. callback is 
 * invoked only for indexes of the array which have assigned values; it is not
 * invoked for indexes which have been deleted or which have never been assigned values.
 * @param   {Function} callback     Callback function. It is bound to context and invoked
 *                                  with three arguments (element, index, array).
 * @param   {Any} [context]         Callback function context.
 * @return  {Boolean} If callback returns a falsy value, immediately returns false.
 *          Otherwise, if callback returned a true value for all elements,
 *          returns true.
 */
Array.prototype.every = Array.prototype.every || function (callback /*, context */)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
    if (this === void 0 || this === null)
        throw new TypeError('"this" is null or not defined.');

    var t = Object(this),
        n = t.length >>> 0;

    if (typeof callback !== 'function')
        throw new TypeError('callback must be a function.');

    var context = arguments.length >= 2 ? arguments[1] : void 0;

    for (var i = 0; i < n; i++)
    {
        if (i in t && !callback.call(context, t[i], i, t))
            return false;
    }

    return true;
};

/**
 * Executes the provided callback function once for each element present in
 * the array until it finds one where callback returns a true value.
 * callback is invoked only for indexes of the array which have
 * assigned values; it is not invoked for indexes which have been deleted or
 * which have never been assigned values.
 * @param   {Function} callback     Callback function. It is bound to context and invoked
 *                                  with three arguments (element, index, array).
 * @param   {Any} [context]         Callback function context.
 * @return  {Boolean} If callback returns a true value, immediately returns true.
 *          Otherwise, if callback returned a falsy value for all elements,
 *          returns false.
 */
Array.prototype.some = Array.prototype.some || function (callback /*, context */)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
    if (this === void 0 || this === null)
        throw new TypeError('"this" is null or not defined.');

    var t = Object(this),
        n = t.length >>> 0;

    if (typeof callback !== 'function')
        throw new TypeError('callback must be a function.');

    var context = arguments.length >= 2 ? arguments[1] : void 0;

    for (var i = 0; i < n; i++)
    {
        if (i in t && callback.call(context, t[i], i, t))
            return true;
    }

    return false;
};

/**
 * Creates a new array with the results of calling a provided function on
 * every element in this array. callback is invoked only for indexes of the
 * array which have assigned values; it is not invoked for indexes which have
 * been deleted or which have never been assigned values.
 * @param   {Function} callback     Callback function. It is bound to context and invoked
 *                                  with three arguments (element, index, array).
 * @param   {Any} [context]         Callback function context.
 * @return  {Array} New array built by calling the provided function on every element
 *          in this array.
 */
Array.prototype.map = Array.prototype.map || function (callback /*, context */)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    if (this === void 0 || this === null)
        throw new TypeError();

    var t = Object(this),
        n = t.length >>> 0;

    if (typeof callback !== "function")
        throw new TypeError('callback must be a function.');

    var res = new Array(n),
        context = arguments.length >= 2 ? arguments[1] : void 0;

    for (var i = 0; i < n; i++)
    {
        // NOTE: Absolute correctness would demand Object.defineProperty to
        // be used, but it's not implemented in ExtendScript
        if (i in t)
            res[i] = callback.call(context, t[i], i, t);
    }

    return res;
};

/**
 * Gets the first index at which a given element can be found in the array,
 * or -1 if it is not present.
 * @param   {Any} searchElement     Element to locate in the array.
 * @param   {Number} [fromIndex=0]  The index to start the search at, defaults to 0.
 * @return  {Number} Index at which the given element was found in the array; otherwise, -1.
 */
Array.prototype.indexOf = Array.prototype.indexOf || function (searchElement /*, fromIndex*/)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    if (this === undefined || this === null)
        throw new TypeError('"this" is null or not defined.');

    var t = Object(this),
        length = t.length >>> 0,
        fromIndex = arguments.length >= 2 ? +arguments[1] : 0;

    if (Math.abs(fromIndex) === Infinity)
        fromIndex = 0;

    if (fromIndex < 0)
    {
        fromIndex += length;
        if (fromIndex < 0)
            fromIndex = 0;
    }

    for (; fromIndex < length; fromIndex++)
    {
        if (t[fromIndex] === searchElement)
            return fromIndex;
    }

    return -1;
};

/**
 * Gets the first index at which a given element can be found in the array,
 * or -1 if it is not present. The array is searched backwards, starting at fromIndex.
 * @param   {Any} searchElement     Element to locate in the array.
 * @param   {Number} [fromIndex]    The index to start the search at, defaults to the array's length.
 *                                  If the index is greater than or equal to the length of the array, the whole
 *                                  array will be searched. If negative, it is taken as the offset from the end
 *                                  of the array. Note that even when the index is negative, the array is still
 *                                  searched from back to front. If the calculated index is less than 0, -1 is
 *                                  returned, i.e. the array will not be searched.
 * @return  {Number} Index at which the given element was found in the array; otherwise, -1.
 */
Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || function (searchElement /*, fromIndex*/)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf
    if (this === undefined || this === null)
        throw new TypeError('"this" is null or not defined.');

    var n, k,
        t = Object(this),
        len = t.length >>> 0;

    if (len === 0)
        return -1;

    n = len;
    if (arguments.length > 1)
    {
        n = Number(arguments[1]);

        if (n != n)
        {
            n = 0;
        }
        else if (n != 0 && n != (1 / 0) && n != -(1 / 0))
        {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
    }

    for (k = n >= 0
          ? Math.min(n, len - 1)
          : len - Math.abs(n) ; k >= 0; k--)
    {
        if (k in t && t[k] === searchElement)
            return k;
    }

    return -1;
};

/**
 * Creates a new array with all elements that pass the test implemented by
 * the provided function. callback is invoked only for indexes of the
 * array which have assigned values; it is not invoked for indexes which have
 * been deleted or which have never been assigned values.
 * @param   {Function} callback     Callback function. It is bound to context and invoked
 *                                  with three arguments (element, index, array).
 * @param   {Any} [context]         Callback function context.
 * @return  {Array} New array built by calling the provided function on every element
 *          in this array.
 */
Array.prototype.filter = Array.prototype.filter || function (callback /*, context */)
{
    if (this === void 0 || this === null)
        throw new TypeError('"this" is null or not defined.');

    var t = Object(this),
        n = t.length >>> 0;

    if (typeof callback != "function")
        throw new TypeError('callback must be a function.');

    var res = [],
        context = arguments.length >= 2 ? arguments[1] : void 0;

    for (var i = 0; i < n; i++)
    {
        if (i in t)
        {
            var val = t[i];
            // NOTE: Technically this should Object.defineProperty at the next index as
            // push can be affected by properties on Object.prototype and Array.prototype,
            // but it's not implemented in ExtendScript.
            if (callback.call(context, val, i, t))
                res.push(val);
        }
    }

    return res;
};

/**
 * Applies a function against an accumulator and each value of the array (from left-to-right)
 * has to reduce it to a single value.
 * @param   {Function} callback     Function to execute on each value in the array, taking four arguments
 *                                  (previousValue, currentValue, index, array).
 *                                  previousValue: The value previously returned in the last invocation of the
 *                                  callback, or initialValue, if supplied.
 *                                  currentValue: The current element being processed in the array.
 *                                  index: The index of the current element being processed in the array.
 *                                  array: The array reduce was called upon. 
 * @param   {Any} [initialValue]    Object to use as the first argument to the first call of the callback.
 * @return  {Any} Reduced value.
 */
Array.prototype.reduce = Array.prototype.reduce || function (callback /*, initialValue*/)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce

    if (this === null || typeof this === 'undefined')
        throw new TypeError('Array.prototype.reduce called on null or undefined.');

    if (typeof callback !== 'function')
        throw new TypeError(callback + ' is not a function');

    var t = Object(this), len = t.length >>> 0, k = 0, value;

    if (arguments.length >= 2)
    {
        value = arguments[1];
    }
    else
    {
        while (k < len && !k in t)
            k++;

        if (k >= len)
            throw new TypeError('Reduce of empty array with no initial value.');

        value = t[k++];
    }

    for (; k < len ; k++)
    {
        if (k in t)
            value = callback(value, t[k], k, t);
    }

    return value;
};

/**
 * Applies a function against an accumulator and each value of the array (from right-to-left)
 * has to reduce it to a single value.
 * @param   {Function} callback     Function to execute on each value in the array, taking four arguments
 *                                  (previousValue, currentValue, index, array).
 *                                  previousValue: The value previously returned in the last invocation of the
 *                                  callback, or initialValue, if supplied.
 *                                  currentValue: The current element being processed in the array.
 *                                  index: The index of the current element being processed in the array.
 *                                  array: The array reduce was called upon. 
 * @param   {Any} [initialValue]    Object to use as the first argument to the first call of the callback.
 * @return  {Any} Reduced value.
 */
Array.prototype.reduceRight = Array.prototype.reduceRight || function (callback /*, initialValue*/)
{
    // Polyfill
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight

    if (this === null || typeof this === 'undefined')
        throw new TypeError('Array.prototype.reduce called on null or undefined.');

    if (typeof callback !== 'function')
        throw new TypeError(callback + ' is not a function.');

    var t = Object(this), len = t.length >>> 0, k = len - 1, value;

    if (arguments.length >= 2)
    {
        value = arguments[1];
    }
    else
    {
        while (k >= 0 && !k in t)
            k--;

        if (k < 0)
            throw new TypeError('Reduce of empty array with no initial value.');

        value = t[k--];
    }

    for (; k >= 0 ; k--)
    {
        if (k in t)
            value = callback(value, t[k], k, t);
    }

    return value;
};

/**
 * Gets the keys contained in the object.
 * @return  {Array} An array containing all the keys contained in the object.
 */
Object.keys = Object.keys || (function ()
{
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    return function (obj)
    {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === void 0 || obj === null))
            throw new TypeError('Object.keys called on non-object');

        var result = [], prop;

        for (prop in obj)
        {
            if (hasOwnProperty.call(obj, prop))
                result.push(prop);
        }

        return result;
    };
}());

/**
 * Creates a new function that, when called, has its this keyword set to the provided value, with a given
 * sequence of arguments preceding any provided when the new function is called.
 * 
 * @param {Any} context     The value to be passed as the this parameter to the target function when
 *                          the bound function is called.
 * @param {Object} *args    Arguments to prepend to arguments provided to the bound function when invoking
 *                          the target function.
 * 
 * @return  {Function} A copy of the invoking function, with its context and first n arguments pre-assigned.
 */
Function.prototype.bind = Function.prototype.bind || function ()
{
    // Based on:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    if (typeof this !== "function")
        throw new TypeError('"this" is not callable.');

    var args = Array.prototype.slice.call(arguments, 1),
        toBind = this,
        noOp = function () { },
        bound = function ()
        {
            return toBind.apply(this instanceof noOp && oThis
                                   ? this
                                   : oThis,
                                 args.concat(Array.prototype.slice.call(arguments)));
        };

    noOp.prototype = this.prototype;
    bound.prototype = new noOp();
    return bound;
};

/**
 * Determines whether the string begins with the characters of another string.
 * 
 * @param {String} search       The characters to be searched for at the start of this string.
 * @param {Number} [position]   The position in this string at which to begin searching for; defaults to 0.
 * 
 * @return  {Boolean} True if the string begins with the passed string; otherwise, false.
 */
String.prototype.startsWith = String.prototype.startsWith || function (search) // [, position]
{
    /* http://mths.be/startswith v0.2.0 by @mathias */
    if (this == null)
        throw TypeError();

    var string = String(this);

    if (search && toString.call(search) == '[object RegExp]')
        throw TypeError();

    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;

    // `ToInteger`
    var pos = position ? Number(position) : 0;
    if (pos != pos)
        pos = 0; // better `isNaN`

    var start = Math.min(Math.max(pos, 0), stringLength);

    // Avoid the `indexOf` call if no match is possible
    if (searchLength + start > stringLength)
        return false;

    var index = -1;

    while (++index < searchLength)
    {
        if (string.charCodeAt(start + index) != searchString.charCodeAt(index))
            return false;
    }

    return true;
};

/**
 * Determines whether the string contains the characters of another string.
 * 
 * @param {String} search       The characters to be searched for within this string.
 * @param {Number} [position]   The position in this string at which to begin searching for; defaults to 0.
 * 
 * @return  {Boolean} True if the string contains the passed string; otherwise, false.
 */
String.prototype.contains = String.prototype.contains || function (search)
{
    /* http://mths.be/contains v0.2.0 by @mathias */
    if (this == null)
        throw TypeError();

    var string = String(this);
    if (search && toString.call(search) == '[object RegExp]')
        throw TypeError();

    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;

    // `ToInteger`
    var pos = position ? Number(position) : 0;
    if (pos != pos)
        pos = 0; // better `isNaN`

    var start = Math.min(Math.max(pos, 0), stringLength);

    // Avoid the `indexOf` call if no match is possible
    if (searchLength + start > stringLength)
        return false;

    return indexOf.call(string, searchString, pos) != -1;
};

/**
 * Determines whether the string ends with the characters of another string.
 * 
 * @param {String} search       The characters to be searched for at the end of this string.
 * @param {Number} [position]   The position in this string at which to begin searching for; defaults to this string's
 *                              actual length, clamped within the range established by this string's length.
 * 
 * @return  {Boolean} True if the string ends with the passed string; otherwise, false.
 */
String.prototype.endsWith = String.prototype.endsWith || function (search)
{
    /* http://mths.be/endswith v0.2.0 by @mathias */
    if (this == null)
        throw TypeError();

    var string = String(this);

    if (search && toString.call(search) == '[object RegExp]')
        throw TypeError();

    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;

    if (arguments.length > 1)
    {
        var position = arguments[1];

        if (position !== undefined)
        {
            // `ToInteger`
            pos = position ? Number(position) : 0;

            if (pos != pos)
                pos = 0; // better `isNaN`
        }
    }

    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;

    if (start < 0)
        return false;

    var index = -1;

    while (++index < searchLength)
    {
        if (string.charCodeAt(start + index) != searchString.charCodeAt(index))
            return false;
    }

    return true;
};

/**
 * Constructs and returns a new string which contains the specified number of copies of
 * the string on which it was called, concatenated together.
 * 
 * @param {Number} count    An integer between 0 and +Infinity, indicating the number of times to repeat
 *                          the string in the newly-created string that is to be returned.
 * 
 * @return {String} The concatenated string.
 */
String.prototype.repeat = String.prototype.repeat || function (count)
{
    /* http://mths.be/repeat v0.2.0 by @mathias */
    // Also see this http://stackoverflow.com/a/17800645 about string concatenation
    if (this == null)
        throw TypeError();

    var string = String(this);

    // `ToInteger`
    var n = count ? Number(count) : 0;

    if (n != n)
        n = 0; // better `isNaN`

    // Account for out-of-bounds indices
    if (n < 0 || n == Infinity)
        throw RangeError();

    var result = '';

    while (n)
    {
        if (n % 2 == 1)
            result += string;

        if (n > 1)
            string += string;

        n >>= 1;
    }

    return result;
};