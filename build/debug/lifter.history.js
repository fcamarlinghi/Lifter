/*!
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

; (function ()
{
$.strict = true;

// Public interface
/**
 * A collection of utilities that make extensive use of Action Manager code
 * to provide fast access to Photoshop functionality without accessing the DOM.
 */
var Lifter = this.Lifter = function Lifter() { };
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

// Global public types
/** 
 * Contains utility methods to deal with Enumerators.
 */
var Enumeration = this.Enumeration = function Enumeration() { };

/**
 * Searches the specified enumerator value in enumeration.
 *
 * @param   enumeration     Enumeration type.
 * @param   value           Enumerator value.
 *
 * @return  Enumerator with the specified value is found in enumeration; otherwise, null.
 */
Enumeration.fromValue = function (enumeration, value)
{
    if (typeof enumeration !== 'function')
        throw new TypeError(['Invalid enumeration "', enumeration, '".'].join(''));

    value = +value || 0;
    var enumKeys = Object.keys(enumeration),
        enumerator;

    for (var i = 0, n = enumKeys.length; i < n; i++)
    {
        enumerator = enumeration[enumKeys[i]];

        if (enumerator.valueOf && enumerator.valueOf() === value)
            return enumerator;
    }

    return null;
};

/**
 * Gets whether the specified enumerator value exists in enumeration.
 *
 * @param   enumeration     Enumeration type.
 * @param   value           Enumerator value.
 *
 * @return  True if the enumerator with the specified value is found in enumeration; otherwise, false.
 */
Enumeration.contains = function (enumeration, value)
{
    return Enumeration.fromValue(enumeration, value) !== null;
};

/**
 * Gets an array containing all the enumerators of the specified enumeration.
 *
 * @param   enumeration     Enumeration type.
 *
 * @return  An array containing all the enumerators of the specified enumeration.
 */
Enumeration.toArray = function (enumeration)
{
    if (typeof enumeration !== 'function')
        throw new TypeError(['Invalid enumeration "', enumeration, '".'].join(''));

    var enumKeys = Object.keys(enumeration),
        enumKeysLength = enumKeys.length,
        enumerator,
        result = [];

    for (var i = 0; i < enumKeysLength; i++)
    {
        enumerator = enumeration[enumKeys[i]];

        if (enumerator instanceof Enumerator)
            result.push(enumerator);
    }

    return result;
};

/** 
 * Represents an enumeration value by trying to mimic the built-in Enumerator class.
 */
var Enumerator = this.Enumerator = function Enumerator(name, value)
{
    this.__name = name;
    this.__value = value;
};

Enumerator.prototype = {
    'toString': function () { return this.__name; },
    'valueOf': function () { return this.__value; },
    '+': function (operand, rev) { return undefined; },
    '-': function (operand, rev) { return undefined; },
    '*': function (operand, rev) { return undefined; },
    '/': function (operand, rev) { return undefined; },
    '~': function (operand, rev) { return undefined; },
    '===': function (operand, rev) { return (!operand || !operand.valueOf) ? false : operand.valueOf() === this.valueOf(); },
    '==': function (operand, rev) { return (!operand || !operand.valueOf) ? false : operand.valueOf() == this.valueOf(); },
    '<': function (operand, rev)
    {
        if (!operand || !operand.valueOf)
            return undefined;
        else
            return this.valueOf() < operand.valueOf();
    },
    '<=': function (operand, rev)
    {
        if (!operand || !operand.valueOf)
        {
            return undefined;
        }
        else
        {
            if (rev)
                return this.valueOf() >= operand.valueOf();
            else
                return this.valueOf() <= operand.valueOf();
        }
    },
};

/** 
 * Represents a UnitDouble action descriptor property.
 * Useful to be able to store the UnitDouble type while still being
 * able to easily perform operations using its value.
 */
var UnitDouble = this.UnitDouble = function UnitDouble(unitType, doubleValue)
{
    this.unitType = unitType;
    this.doubleValue = doubleValue;
};

UnitDouble.prototype = {
    'toString': function () { return this.unitType + ' = ' + this.doubleValue; },
    'valueOf': function () { return this.doubleValue; },
    '+': function (operand, rev) { return this.doubleValue + operand; },
    '-': function (operand, rev) { return (rev) ? operand - this.doubleValue : this.doubleValue - operand; },
    '*': function (operand, rev) { return this.doubleValue * operand; },
    '/': function (operand, rev) { return (rev) ? operand / this.doubleValue : this.doubleValue / operand; },
    '~': function (operand, rev) { return undefined; },
    '===': function (operand, rev) { return (!operand || !operand.valueOf) ? false : operand.valueOf() === this.valueOf(); },
    '==': function (operand, rev) { return (!operand || !operand.valueOf) ? false : operand.valueOf() == this.valueOf(); },
    '<': function (operand, rev)
    {
        if (!operand || !operand.valueOf)
            return undefined;
        else
            return this.valueOf() < operand.valueOf();
    },
    '<=': function (operand, rev)
    {
        if (!operand || !operand.valueOf)
        {
            return undefined;
        }
        else
        {
            if (rev)
                return this.valueOf() >= operand.valueOf();
            else
                return this.valueOf() <= operand.valueOf();
        }
    },
};

/** 
 * Represents bounds information for a layer.
 */
var LayerBounds = this.LayerBounds = function LayerBounds(top, left, bottom, right)
{
    // Bounds seem to always be in pixels
    this.top = new UnitValue(top, 'px');
    this.left = new UnitValue(left, 'px');
    this.bottom = new UnitValue(bottom, 'px');
    this.right = new UnitValue(right, 'px');
};

LayerBounds.prototype = {
    'toString': function () { return [this.top, this.left, this.bottom, this.right].join(', '); },
    'valueOf': function () { return undefined; },
    '+': function (operand, rev) { return undefined; },
    '-': function (operand, rev) { return undefined; },
    '*': function (operand, rev) { return undefined; },
    '/': function (operand, rev) { return undefined; },
    '~': function (operand, rev) { return undefined; },
    '===': function (operand, rev)
    {
        return (!operand) ? false : (
            operand.top === this.top
            && operand.left === this.left
            && operand.bottom === this.bottom
            && operand.right === this.right
        );
    },
    '==': function (operand, rev) { return operand === this; },
    '<': function (operand, rev) { return undefined; },
    '<=': function (operand, rev) { return undefined; },
};

/**
 * Enumerates layer types.
 */
var LayerType = this.LayerType = function LayerType() { };
LayerType.SETSTART = new Enumerator('LayerType.SETSTART', 0);
LayerType.SETEND = new Enumerator('LayerType.SETEND', 1);
LayerType.CONTENT = new Enumerator('LayerType.CONTENT', 2);

/**
 * Enumerates layer colors.
 */
var LayerColor = this.LayerColor = function LayerColor() { };
LayerColor.NONE = new Enumerator('LayerColor.NONE', charIDToTypeID('None'));
LayerColor.RED = new Enumerator('LayerColor.RED', charIDToTypeID('Rd  '));
LayerColor.ORANGE = new Enumerator('LayerColor.ORANGE', charIDToTypeID('Orng'));
LayerColor.YELLOW = new Enumerator('LayerColor.YELLOW', charIDToTypeID('Ylw '));
LayerColor.GREEN = new Enumerator('LayerColor.GREEN', charIDToTypeID('Grn '));
LayerColor.BLUE = new Enumerator('LayerColor.BLUE', charIDToTypeID('Bl  '));
LayerColor.VIOLET = new Enumerator('LayerColor.VIOLET', charIDToTypeID('Vlt '));
LayerColor.GRAY = new Enumerator('LayerColor.GRAY', charIDToTypeID('Gry '));

/**
 * Enumerates blend modes. Acts as an useful proxy to Photoshop BlendMode enumeration.
 */
var LifterBlendMode = this.LifterBlendMode = function LifterBlendMode() { };
LifterBlendMode.PASSTHROUGH = new Enumerator('LifterBlendMode.PASSTHROUGH', stringIDToTypeID('passThrough'));
LifterBlendMode.NORMAL = new Enumerator('LifterBlendMode.NORMAL', charIDToTypeID('Nrml'));
LifterBlendMode.DISSOLVE = new Enumerator('LifterBlendMode.DISSOLVE', charIDToTypeID('Dslv'));
LifterBlendMode.DARKEN = new Enumerator('LifterBlendMode.DARKEN', charIDToTypeID('Drkn'));
LifterBlendMode.MULTIPLY = new Enumerator('LifterBlendMode.MULTIPLY', charIDToTypeID('Mltp'));
LifterBlendMode.COLORBURN = new Enumerator('LifterBlendMode.COLORBURN', charIDToTypeID('CBrn'));
LifterBlendMode.LINEARBURN = new Enumerator('LifterBlendMode.LINEARBURN', stringIDToTypeID('linearBurn'));
LifterBlendMode.DARKERCOLOR = new Enumerator('LifterBlendMode.DARKERCOLOR', stringIDToTypeID('darkerColor'));
LifterBlendMode.LIGHTEN = new Enumerator('LifterBlendMode.LIGHTEN', charIDToTypeID('Lghn'));
LifterBlendMode.SCREEN = new Enumerator('LifterBlendMode.SCREEN', charIDToTypeID('Scrn'));
LifterBlendMode.COLORDODGE = new Enumerator('LifterBlendMode.COLORDODGE', charIDToTypeID('CDdg'));
LifterBlendMode.LINEARDODGE = new Enumerator('LifterBlendMode.LINEARDODGE', stringIDToTypeID('linearDodge'));
LifterBlendMode.LIGHTERCOLOR = new Enumerator('LifterBlendMode.LIGHTERCOLOR', stringIDToTypeID('lighterColor'));
LifterBlendMode.OVERLAY = new Enumerator('LifterBlendMode.OVERLAY', charIDToTypeID('Ovrl'));
LifterBlendMode.SOFTLIGHT = new Enumerator('LifterBlendMode.SOFTLIGHT', charIDToTypeID('SftL'));
LifterBlendMode.HARDLIGHT = new Enumerator('LifterBlendMode.HARDLIGHT', charIDToTypeID('HrdL'));
LifterBlendMode.VIVIDLIGHT = new Enumerator('LifterBlendMode.VIVIDLIGHT', stringIDToTypeID('vividLight'));
LifterBlendMode.LINEARLIGHT = new Enumerator('LifterBlendMode.LINEARLIGHT', stringIDToTypeID('linearLight'));
LifterBlendMode.PINLIGHT = new Enumerator('LifterBlendMode.PINLIGHT', stringIDToTypeID('pinLight'));
LifterBlendMode.HARDMIX = new Enumerator('LifterBlendMode.HARDMIX', stringIDToTypeID('hardMix'));
LifterBlendMode.DIFFERENCE = new Enumerator('LifterBlendMode.DIFFERENCE', charIDToTypeID('Dfrn'));
LifterBlendMode.EXCLUSION = new Enumerator('LifterBlendMode.EXCLUSION', charIDToTypeID('Xclu'));
LifterBlendMode.SUBTRACT = new Enumerator('LifterBlendMode.SUBTRACT', stringIDToTypeID('blendSubtraction'));
LifterBlendMode.DIVIDE = new Enumerator('LifterBlendMode.DIVIDE', stringIDToTypeID('blendDivide'));
LifterBlendMode.HUE = new Enumerator('LifterBlendMode.HUE', charIDToTypeID('H   '));
LifterBlendMode.SATURATION = new Enumerator('LifterBlendMode.SATURATION', charIDToTypeID('Strt'));
LifterBlendMode.COLOR = new Enumerator('LifterBlendMode.COLOR', charIDToTypeID('Clr '));
LifterBlendMode.LUMINOSITY = new Enumerator('LifterBlendMode.LUMINOSITY', charIDToTypeID('Lmns'));

/** Converts the passed BlendMode to a LifterBlendMode. */
LifterBlendMode.fromBlendMode = function (blendMode) { return LifterBlendMode[String(blendMode).replace(/BlendMode\./, '')]; };

/** Converts the passed LifterBlendMode to a BlendMode. */
LifterBlendMode.toBlendMode = function (lifterBlendMode) { return eval(lifterBlendMode.toString().replace(/LifterBlendMode/, 'BlendMode')); /* HACKY!! */ };


// Global utilities
/** Cached reference to DialogModes.NO. */
var _dialogModesNo = DialogModes.NO;

/** 
 * Gets the descriptor property identified by the specified key (encoded as typeId).
 * Type must be a valid DescValueType enumerator. If type is not provided it is
 * automatically guessed.
 * @private
 */
function _getDescriptorProperty(desc, key, type)
{
    type || (type = desc.getType(key));

    switch (type)
    {
        case DescValueType.ALIASTYPE: return desc.getPath(key);
        case DescValueType.BOOLEANTYPE: return desc.getBoolean(key);
        case DescValueType.CLASSTYPE: return desc.getClass(key);
        case DescValueType.DOUBLETYPE: return desc.getDouble(key);
        case DescValueType.ENUMERATEDTYPE: return { 'type': desc.getEnumerationType(key), 'value': desc.getEnumerationValue(key) };
        case DescValueType.INTEGERTYPE: return desc.getInteger(key);
        case DescValueType.LISTTYPE: return desc.getList(key);
        case DescValueType.OBJECTTYPE: return { 'type': desc.getObjectType(key), 'value': desc.getObjectValue(key) };
        case DescValueType.RAWTYPE: return desc.getData(key);
        case DescValueType.REFERENCETYPE: return desc.getReference(key);
        case DescValueType.STRINGTYPE: return desc.getString(key);
        case DescValueType.UNITDOUBLE: return new UnitDouble(desc.getUnitDoubleType(key), desc.getUnitDoubleValue(key));
        default: throw new Error(['Unsupported descriptor value type: "', type, '".'].join(''));
    }
};

/** 
 * Gets a wrapped ActionDescriptor, whose properties can be accessed and set using
 * Lifter syntactic sugar.
 */
function _getWrappedActionDescriptor(desc, props, id)
{
    var fn = function (desc, props, id, name, value)
    {
        if (!props.hasOwnProperty(name))
            throw new Error(['Invalid property: "', name, '".'].join(''));

        var prop = props[name];

        if (typeof value === 'undefined')
        {
            // Get
            if (prop.get)
            {
                // Use custom getter for this property
                return prop.get.call(null, prop, id, desc);
            }
            else
            {
                // Call generic getter
                return _getDescriptorProperty(desc, prop.typeId, prop.type);
            }
        }
        else
        {
            // Set
            if (!prop.set)
                throw new Error(['Property "', name, '" is read-only.'].join(''));

            // Set value
            prop.set.call(null, prop, id, value);
        }
    };

    return {
        innerDescriptor: desc,
        prop: fn.bind(null, desc, props, id),
    };
};

/** 
 * Converts a 0-255 integer value to its 100-based percentage equivalent.
 * @private
 */
function _byteToPercent(value) { return (value / 255.0) * 100.0; };

/** 
 * Iterates over a collection searching for the specified patterns.
 * @private
 */
function _find(collection, findType, patterns, context)
{
    function __match(id)
    {
        for (var j = 0; j < keysLength; j++)
        {
            if (patterns[keys[j]] !== collection.prop(id, keys[j]))
                return false;
        }

        found.push(id);
        return true;
    };

    if (typeof patterns !== 'function')
    {
        if (typeof patterns !== 'object')
            throw new Error('Search patterns must be either a function or an object.');

        var found = [],
            keys = Object.keys(patterns),
            keysLength = keys.length;

        switch (findType)
        {
            case 2:
                // Find last
                collection.forEach(function (itemIndex, id)
                {
                    if (__match.call(null, id))
                        return true;
                }, null, true);

                return found.length ? found[0] : null;

            case 1:
                // Find first
                collection.forEach(function (itemIndex, id)
                {
                    if (__match.call(null, id))
                        return true;
                }, null);

                return found.length ? found[0] : null;

            default:
                // Find all
                collection.forEach(function (itemIndex, id)
                {
                    __match.call(null, id);
                }, null);

                return found;
        }
    }
    else
    {
        collection.forEach(patterns, context);
    }
};

/** 
 * Gets a valid File object from the passed parameter.
 * @private
 */
function _ensureFile(file)
{
    if (!(file instanceof File))
        file = new File(file);

    if (!file.exists)
        throw new Error(['The specified file does not exists: "', file, '".'].join(''));

    return file;
};
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
 * creates a new function that, when called, has its this keyword set to the provided value, with a given
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

// Custom language extensions
/**
 * Extends the object with the properties of the specified objects.
 * @param {Object} *source Source objects.
 */
Object.prototype.extend = Object.prototype.extend || function ()
{
    if (this === null || typeof this === 'undefined')
        throw new TypeError('Object.prototype.extend called on null or undefined.');

    if (arguments.length === 0) return this;

    var sources = Array.prototype.slice.call(arguments),
        source, prop, i, length = sources.length;

    for (i = 0; i < length; i++)
    {
        source = sources[i];

        for (prop in source)
        {
            if (source.hasOwnProperty(prop))
                this[prop] = source[prop];
        }
    }
};

/**
 * Extends the object with the properties of the specified objects, but only
 * if the properties aren't already present in the base object.
 * @param {Object} *source Source objects.
 */
Object.prototype.defaults = Object.prototype.defaults || function ()
{
    if (this === null || typeof this === 'undefined')
        throw new TypeError('Object.prototype.defaults called on null or undefined.');

    if (arguments.length === 0) return this;

    var sources = Array.prototype.slice.call(arguments),
        source, prop, i, length = sources.length;

    for (i = 0; i < length; i++)
    {
        source = sources[i];

        for (prop in source)
        {
            if (source.hasOwnProperty(prop) && typeof this[prop] === 'undefined')
                this[prop] = source[prop];
        }
    }
};

/**
 * Creates a clone of the object.
 * @return {Object} A clone of the object.
 */
Object.prototype.clone = function ()
{
    var copy = {};

    for (var attr in this)
    {
        if (typeof this[attr] !== 'object')
            copy[attr] = this[attr];
        else if (this[attr] === this)
            copy[attr] = copy;
        else
            copy[attr] = this[attr].clone();
    }

    return copy;
};

/**
 * Creates a clone of the object.
 * @return {Array} A clone of the object.
 */
Array.prototype.clone = function ()
{
    var copy = [];

    for (var i = 0, n = this.length; i < n; i++)
    {
        if (typeof this[i] !== 'object')
            copy[i] = this[i];
        else if (this[i] === this)
            copy[i] = copy;
        else
            copy[i] = this[i].clone();
    }

    return copy;
};

/**
 * Creates a clone of the object.
 * @return {Date} A clone of the object.
 */
Date.prototype.clone = function ()
{
    var copy = new Date();
    copy.setTime(this.getTime());
    return copy;
};

/**
 * Creates a clone of the object.
 * @return {Any} A clone of the object.
 */
Number.prototype.clone = Boolean.prototype.clone = String.prototype.clone = function ()
{
    return this;
};
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

; (function ()
{
    var history = {};

    /** Puts the correct value in 'ref' to the get the history state specified by HistoryId. @private */
    function _getHistoryIdRef(historyId, ref)
    {
        if (typeof historyId !== 'number')
        {
            // If historyId is not passed, assume current history state
            ref.putEnumerated(charIDToTypeID('HstS'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else
        {
            // Use historyId directly
            ref.putIdentifier(charIDToTypeID('HstS'), historyId);
        }
    };

    /** Traverse history in the specified direction, selecting the according history state. @private */
    function _traverseHistory(direction)
    {
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('HstS'), charIDToTypeID('Ordn'), direction);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        return this;
    };


    /**
    * Supported history state properties. This is public so that additional properties can be added at runtime.
    */
    history.supportedProperties = {
        'itemIndex': {
            typeId: charIDToTypeID('ItmI'),
            type: DescValueType.INTEGERTYPE,
            set: false,
        },
        'historyId': {
            typeId: charIDToTypeID('Idnt'),
            type: DescValueType.INTEGERTYPE,
            set: false,
        },
        'name': {
            typeId: charIDToTypeID('Nm  '),
            type: DescValueType.STRINGTYPE,
            set: false,
        },
        'auto': {
            typeId: charIDToTypeID('Auto'),
            type: DescValueType.BOOLEANTYPE,
            set: false,
        },
        'historyBrushSource': {
            typeId: charIDToTypeID('HstB'),
            type: DescValueType.BOOLEANTYPE,
            set: false,
        },
        'currentHistoryState': {
            typeId: charIDToTypeID('CrnH'),
            type: DescValueType.BOOLEANTYPE,
            set: false,
        },
    };

    /** 
     * Gets the number of history states for the currently active document.
     * @return Number of history states for the currently active document.
     */
    history.count = function ()
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Cnt '));
        ref.putEnumerated(charIDToTypeID('HstS'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        return executeActionGet(ref).getInteger(charIDToTypeID('Cnt '));
    };

    /**
     * Gets the identifier of the history state identified by the passed ItemIndex.
     * @param {Number} itemIndex History state ItemIndex.
     * @return {Number} History state identifier.
     */
    history.getHistoryIdFromItemIndex = function (itemIndex)
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Idnt'));
        ref.putIndex(charIDToTypeID('HstS'), itemIndex);
        return executeActionGet(ref).getInteger(charIDToTypeID('Idnt'));
    };

    /**
     * Gets the identifier of the currently active history state.
     * @return {Number} HistoryId of the currently active history state.
     */
    history.getActiveHistoryId = function ()
    {
        return history.prop('historyId');
    };

    /**
     * Iterates over the history states stack, executing the specified callback on each element.
     * Please note: Adding or removing history states while iterating is not supported.
     * @param {Function} callback       Callback function. It is bound to context and invoked with two arguments (itemIndex, historyStateId).
     *                                  If callback returns true, iteration is stopped.
     * @param {Object} [context=null]   Callback function context.
     * @param {Boolean} [reverse=false] Whether to iterate from the end of the history states stack.
     * @return Chained reference to history utilities.
     */
    history.forEach = function (callback, context, reverse) // callback[, context[, reverse]]
    {
        if (typeof callback !== 'function')
            throw new Error('Callback must be a valid function.');

        var n, i;

        if (reverse)
        {
            i = history.count() + 1;
            n = 0;

            while (--i > n)
            {
                if (callback.call(context, i, history.getHistoryIdFromItemIndex(i)))
                    break;
            }
        }
        else
        {
            n = history.count() + 1;
            i = 0;

            while (++i < n)
            {
                if (callback.call(context, i, history.getHistoryIdFromItemIndex(i)))
                    break;
            }
        }

        return history;
    };

    /**
     * Gets or sets the property with the given name on the specified history state. If invoked with no arguments
     * gets a wrapped ActionDescriptor containing all the properties of the specified history state.
     * @param {Number} [historyId] History state identifier, defaults to currently active history state if null or not specified.
     * @param {String} [name] Property name.
     * @param {Any} [value]Property value.
     * @return {Any, ActionDescriptor, Object}  Property value when getting a property, a wrapped ActionDescriptor when invoked with no arguments
     *                                          or a chained reference to document utilities when setting a property.
     */
    history.prop = function ()
    {
        // Parse args
        var historyId, name, value, ref, desc;

        if (typeof arguments[0] === 'number'
            || (!arguments[0] && arguments.length > 1))
        {
            historyId = arguments[0];
            name = arguments[1];
            value = arguments[2];
        }
        else
        {
            name = arguments[0];
            value = arguments[1];
        }

        if (typeof name === 'undefined')
        {
            // Get wrapped action descriptor
            ref = new ActionReference();
            _getHistoryIdRef(historyId, ref);
            desc = executeActionGet(ref);
            return _getWrappedActionDescriptor(desc, history.supportedProperties, historyId || desc.getInteger(charIDToTypeID('Idnt')));
        }
        else
        {
            // Find property
            if (!history.supportedProperties.hasOwnProperty(name))
                throw new Error(['Invalid history state property: "', name, '".'].join(''));

            var prop = history.supportedProperties[name];

            if (typeof value === 'undefined')
            {
                // Get
                // Get ActionDescriptor for specified history state
                ref = new ActionReference();

                if (prop.typeId)
                    ref.putProperty(charIDToTypeID('Prpr'), prop.typeId);

                _getHistoryIdRef(historyId, ref);
                desc = executeActionGet(ref);

                if (prop.get)
                {
                    // Use custom getter for this property
                    return prop.get.call(null, prop, historyId, desc);
                }
                else
                {
                    // Call getter for specific type
                    return _getDescriptorProperty(desc, prop.typeId, prop.type);
                }
            }
            else
            {
                // Set
                if (!prop.set)
                    throw new Error(['Property "', name, '" is read-only.'].join(''));;

                // Set value
                prop.set.call(null, prop, historyId, value);
                return history;
            }
        }
    };

    /**
     * Finds all the history states that match the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Array} An array containing find results.
     */
    history.findAll = _find.bind(null, history, 0);

    /**
     * Finds the first history state that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    history.findFirst = _find.bind(null, history, 1);

    /**
     * Finds the last history state that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    history.findLast = _find.bind(null, history, 2);

    /**
     * Sets the currently active history state to the one identified by the passed HistoryId.
     * @param {Number} historyId History state identifier.
     * @return Chained reference to history utilities.
     */
    history.makeActive = function (historyId)
    {
        if (typeof historyId !== 'number' || historyId < 1)
            throw new Error(['Invalid history state identifier: "', historyId, '".'].join(''));

        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID('HstS'), historyId);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        return this;
    };

    /**
     * Sets the currently active history state to the one identified by the passed offset.
     * @param {Number} offset Offset from the last history state.
     * @return Chained reference to history utilities.
     */
    history.makeActiveByOffset = function (offset)
    {
        if (typeof offset !== 'number' || offset > 0)
            throw new Error(['Invalid history state offset: "', offset, '".'].join(''));

        var ref = new ActionReference();
        ref.putOffset(charIDToTypeID('HstS'), offset);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        return this;
    };

    /**
     * Sets the currently active history state to the previous one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makePreviousActive = _traverseHistory.bind(null, charIDToTypeID('Prvs'));

    /**
     * Sets the currently active history state to the next one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makeNextActive = _traverseHistory.bind(null, charIDToTypeID('Nxt '));

    /**
     * Sets the currently active history state to the first one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makeFirstActive = _traverseHistory.bind(null, charIDToTypeID('Frst'));

    /**
     * Sets the currently active history state to the last one in the stack.
     * @return Chained reference to history utilities.
     */
    history.makeLastActive = _traverseHistory.bind(null, charIDToTypeID('Lst '));

    /**
     * Duplicates the currently active history state, creating a new document from it.
     * @return Chained reference to history utilities.
     */
    history.duplicate = function ()
    {
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID('Dcmn'));

        var ref2 = new ActionReference();
        ref2.putProperty(charIDToTypeID('HstS'), charIDToTypeID('CrnH'));

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putReference(charIDToTypeID('Usng'), ref2);
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return this;
    };

    /**
     * Deletes the specified history state.
     * @param {Number} [historyId] History state identifier, defaults to currently active history state if not provided.
     * @return Chained reference to history utilities.
     */
    history.remove = function (historyId)
    {
        var ref = new ActionReference();

        if (typeof historyId === 'number')
            ref.putIdentifer(charIDToTypeID('HstS'), historyId);
        else
            ref.putProperty(charIDToTypeID('HstS'), charIDToTypeID('CrnH'));

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);
        return history;
    };

    /**
     * Creates a snapshot from the currently active history state.
     * @param {String} [snapshotName] Snapshot name.
     * @return Chained reference to history utilities.
     */
    history.createSnapshot = function (snapshotName)
    {
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID('SnpS'));

        var ref2 = new ActionReference();
        ref2.putProperty(charIDToTypeID('HstS'), charIDToTypeID('CrnH'));

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putReference(charIDToTypeID('From'), ref2);

        if (typeof snapshotName === 'string' && snapshotName.length)
            desc.putString(charIDToTypeID('Nm  '), snapshotName);

        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return this;
    };

    /**
     * Makes the specified snapshot active.
     * @param {Number, String} snapshot Either an history state identifier or a snapshot name.
     * @return Chained reference to history utilities.
     */
    history.makeSnapshotActive = function (snapshot)
    {
        if (typeof snapshot !== 'number')
            snapshot = history.findFirst({ 'name': snapshot });

        return history.makeActive(snapshot);
    };

    /**
     * Deletes the specified snapshot.
     * @param {Number, String} snapshot Either an history state identifier or a snapshot name.
     * @return Chained reference to history utilities.
     */
    history.deleteSnapshot = function (snapshot)
    {
        var type = typeof snapshot,
            ref = new ActionReference();

        if (type === 'string' && snapshot.length)
            ref.putName(charIDToTypeID('SnpS'), snapshot);
        else if (type === 'number' && snapshot > 0)
            ref.putIdentifier(charIDToTypeID('SnpS'), snapshot);
        else
            throw new Error(['Invalid snapshot identifier or name: "', snapshot, '".'].join(''));

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);
        return history;
    };

    // Public API
    /**
    * Contains low-level methods to work with history without accessing Photoshop DOM.
    */
    Lifter.history = history;
}());

}).call($.global);