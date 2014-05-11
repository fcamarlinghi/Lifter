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

/** Ensures the passed blendMode is expressed using the LifterBlendMode enumeration. @private */
function _ensureLifterBlendMode(blendMode)
{
    if (blendMode instanceof Enumerator)
        return blendMode;
    else
        return LifterBlendMode.fromBlendMode(blendMode);
}

/**
 * Enumerates apply image source channels.
 */
var ApplyImageChannel = this.ApplyImageChannel = function ApplyImageChannel() { };
ApplyImageChannel.RGB = new Enumerator('ApplyImageChannel.RGB', charIDToTypeID('RGB '));
ApplyImageChannel.Red = new Enumerator('ApplyImageChannel.Red', charIDToTypeID('Rd  '));
ApplyImageChannel.Green = new Enumerator('ApplyImageChannel.Green', charIDToTypeID('Grn '));
ApplyImageChannel.Blue = new Enumerator('ApplyImageChannel.Blue', charIDToTypeID('Bl  '));


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

// TODO:
// - Property: grouped (complete support for creating grouped layers).
// - Property: kind (complete support for colorLookup).
// - Property: merge kind and type and add custom LifterLayerKind enumeration.
// - Property: textItem.
// - Property: linkedLayers.
// - Method: move layer!

; (function ()
{
    var layers = {};

    /** Utility object used to temporary hold data during heavy operations. @private */
    var _cache = {};

    /** Sets the passed layer as active and executes the specified callback. @private */
    function _wrapSwitchActive(layerId, callback, context)
    {
        // Set active layer to layerId
        if (layers.prop('layerId') !== layerId)
            layers.stack.makeActive(layerId);

        // Execute code
        callback.call(context);
    };

    /** Gets a ActionDescriptor holding all the properties needed for the Make Layer action. @private */
    function _getMakeLayerDescriptor(name, opacity, blendMode, color)
    {
        // Set layer set properties
        var desc = new ActionDescriptor();

        // Name
        if (typeof name === 'string' && name.length)
            desc.putString(charIDToTypeID('Nm  '), name);

        // Opacity
        opacity = +opacity || 100.0;
        desc.putUnitDouble(charIDToTypeID('Opct'), charIDToTypeID('#Prc'), opacity);

        // Blend mode
        (blendMode && blendMode.valueOf) || (blendMode = BlendMode.NORMAL);
        desc.putEnumerated(charIDToTypeID('Md  '), charIDToTypeID('BlnM'), _ensureLifterBlendMode(blendMode).valueOf());

        // Color
        (color && color.valueOf) || (color = LayerColor.NONE);
        desc.putEnumerated(charIDToTypeID('Clr '), charIDToTypeID('Clr '), color.valueOf());

        return desc;
    };

    /** Puts the correct value in 'ref' to the get the layer specified by LayerId. @private */
    function _getLayerIdRef(layerId, ref)
    {
        if (typeof layerId !== 'number' || layerId === 0)
        {
            // If layerId is not passed, assume current layer
            // If layerId is 0 we're targeting the background layer in a document where background is the only layer
            // Use enumeration to get the background as getting it using LayerId directly will throw an error
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else
        {
            // Use layerId directly
            ref.putIdentifier(charIDToTypeID('Lyr '), layerId);
        }
    };

    /** Puts the correct value in 'ref' to the get the layer specified by ItemIndex. @private */
    function _getItemIndexRef(itemIndex, ref)
    {
        if (typeof itemIndex !== 'number')
        {
            // If itemIndex is not passed, assume current layer
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else if (layers.count() === 0)
        {
            // Layer count is zero if the background layer is the only layer
            // present in the current document
            if (itemIndex !== 1)
                throw new Error(['Could not find layer with ItemIndex "', itemIndex, '".'].join(''));

            // Use enumeration to get the background as getting it using
            // ItemIndex directly will throw an error
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        }
        else
        {
            // Check if document has a background layer and get correct ItemIndex
            if (layers.hasBackground())
                itemIndex--;

            // Use correct layer itemIndex
            ref.putIndex(charIDToTypeID('Lyr '), itemIndex);
        }

        return ref;
    };

    /** Traverse layer stack in the specified direction, returning the according layer identifier. @private */
    function _getStackId(direction)
    {
        // If only the background layer is present in document, just return background layerId
        if (layers.count() === 0)
        {
            return 0;
        }
        else
        {
            var ref = new ActionReference();
            ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('LyrI'));
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), direction);
            return executeActionGet(ref).getInteger(charIDToTypeID('LyrI'));
        }

        return layers;
    };

    /** Traverse layer stack in the specified direction, selecting the according layer. @private */
    function _traverseStack(direction)
    {
        // No need of setting the background layer active, it always is
        if (layers.count() === 0)
            return;

        layers.stack.makeActive(_getStackId(direction));
        return layers;
    }


    /**
     * Supported layer properties. This is public so that additional properties can be added at runtime.
     */
    layers.supportedProperties = {
        'itemIndex': {
            typeId: charIDToTypeID('ItmI'),
            type: DescValueType.INTEGERTYPE,
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set ItemIndex on background layer.');

                // Setting itemIndex moves the layer
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);

                var ref2 = new ActionReference();
                ref2.putIndex(charIDToTypeID('Lyr '), value);

                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                desc.putReference(charIDToTypeID('T   '), ref2);
                desc.putBoolean(charIDToTypeID('Adjs'), false);
                desc.putInteger(charIDToTypeID('Vrsn'), 5);
                executeAction(charIDToTypeID('move'), desc, _dialogModesNo);
            },
        },

        'layerId': { typeId: charIDToTypeID('LyrI'), type: DescValueType.INTEGERTYPE, set: false, },

        'name': {
            typeId: charIDToTypeID('Nm  '),
            type: DescValueType.STRINGTYPE,
            defaultValue: 'Layer',
            set: function (prop, layerId, value)
            {
                // Target layer must be active to change its name
                _wrapSwitchActive(layerId, function ()
                {
                    var ref = new ActionReference();
                    ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
                    var desc = new ActionDescriptor();
                    desc.putReference(charIDToTypeID('null'), ref);
                    var desc2 = new ActionDescriptor();
                    desc2.putString(prop.typeId, value);
                    desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                    executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
                });
            },
        },

        'color': {
            typeId: charIDToTypeID('Clr '),
            type: DescValueType.ENUMERATEDTYPE,
            defaultValue: LayerColor.NONE,
            get: function (prop, layerId, desc)
            {
                // Parse color
                return Enumeration.fromValue(LayerColor, desc.getEnumerationValue(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                // Target layer must be active to change its color
                _wrapSwitchActive(layerId, function ()
                {
                    var ref = new ActionReference();
                    _getLayerIdRef(layerId, ref);
                    var desc = new ActionDescriptor();
                    desc.putReference(charIDToTypeID('null'), ref);
                    var desc2 = new ActionDescriptor();
                    desc2.putEnumerated(charIDToTypeID('Clr '), charIDToTypeID('Clr '), value.valueOf());
                    desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                    executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
                });
            },
        },

        'visible': {
            typeId: charIDToTypeID('Vsbl'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: true,
            set: function (prop, layerId, value)
            {
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var list = new ActionList();
                list.putReference(ref);
                var desc = new ActionDescriptor();
                desc.putList(charIDToTypeID('null'), list);

                if (value)
                    executeAction(charIDToTypeID('Shw '), desc, _dialogModesNo);
                else
                    executeAction(charIDToTypeID('Hd  '), desc, _dialogModesNo);
            },
        },

        'opacity': {
            typeId: charIDToTypeID('Opct'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: 100.0,
            get: function (prop, layerId, desc)
            {
                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                // Layer must be visible to be able to apply opacity
                // or an error is thrown by AM
                var oldVisible = layers.prop(layerId, 'visible');

                if (!oldVisible)
                    layers.prop(layerId, 'visible', true);

                // Apply new opacity
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);

                // Reset visibility
                if (!oldVisible)
                    layers.prop(layerId, 'visible', false);
            },
        },

        'fillOpacity': {
            typeId: stringIDToTypeID('fillOpacity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: 100.0,
            get: function (prop, layerId, desc)
            {
                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Applying fill opacity to layer sets is not supported by Action Manager (nor by DOM).');

                // Layer must be visible to be able to apply fillOpacity
                // or an error is thrown by AM
                var oldVisible = layers.prop(layerId, 'visible');

                if (!oldVisible)
                    layers.prop(layerId, 'visible', true);

                // Apply new fillOpacity
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);

                // Reset visibility
                if (!oldVisible)
                    layers.prop(layerId, 'visible', false);
            },
        },

        'blendMode': {
            typeId: charIDToTypeID('Md  '),
            type: DescValueType.ENUMERATEDTYPE,
            defaultValue: BlendMode.NORMAL,
            get: function (prop, layerId, desc)
            {
                // Parse blend mode
                return Enumeration.fromValue(LifterBlendMode, desc.getEnumerationValue(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                // Passthrough is unsupported on layers, but does not throw an error,
                // thus no checks are implemented
                // Get value from LifterBlendMode enum
                value = _ensureLifterBlendMode(value).valueOf();

                // Set blend mode
                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putEnumerated(prop.typeId, charIDToTypeID('BlnM'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'type': {
            typeId: stringIDToTypeID('layerSection'),
            type: DescValueType.ENUMERATEDTYPE,
            get: function (prop, layerId, desc)
            {
                var type = typeIDToStringID(desc.getEnumerationValue(prop.typeId));

                switch (type)
                {
                    case 'layerSectionStart': return LayerType.SETSTART;
                    case 'layerSectionEnd': return LayerType.SETEND;
                    case 'layerSectionContent': return LayerType.CONTENT;
                    default: throw new Error(['Unsupported layer type encountered: "', type, '".'].join(''));
                }
            },
            set: false,
        },

        'kind': {
            get: function (prop, layerId, desc)
            {
                // Based on:
                // http://www.ps-scripts.com/bb/viewtopic.php?f=9&t=5656
                // Throw error if layer set
                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Unable to get "kind" for layer sets.');

                if (desc.hasKey(stringIDToTypeID('textKey')))
                    return LayerKind.TEXT;

                // Includes LayerKind.VIDEO
                if (desc.hasKey(stringIDToTypeID('smartObject')))
                    return LayerKind.SMARTOBJECT;

                if (desc.hasKey(stringIDToTypeID('layer3D')))
                    return LayerKind.LAYER3D;

                var adjustmentType = stringIDToTypeID('adjustment');

                if (desc.hasKey(adjustmentType))
                {
                    var adjustmentKind = typeIDToStringID(desc.getList(adjustmentType).getClass(0));

                    switch (adjustmentKind)
                    {
                        case 'photoFilter': return LayerKind.PHOTOFILTER;
                        case 'solidColorLayer': return LayerKind.SOLIDFILL;
                        case 'gradientMapClass': return LayerKind.GRADIENTMAP;
                        case 'gradientMapLayer': return LayerKind.GRADIENTFILL;
                        case 'hueSaturation': return LayerKind.HUESATURATION;
                        case 'colorLookup': return; // This does not exist and throws an error
                        case 'colorBalance': return LayerKind.COLORBALANCE;
                        case 'patternLayer': return LayerKind.PATTERNFILL;
                        case 'invert': return LayerKind.INVERSION;
                        case 'posterization': return LayerKind.POSTERIZE;
                        case 'thresholdClassEvent': return LayerKind.THRESHOLD;
                        case 'blackAndWhite': return LayerKind.BLACKANDWHITE;
                        case 'selectiveColor': return LayerKind.SELECTIVECOLOR;
                        case 'vibrance': return LayerKind.VIBRANCE;
                        case 'brightnessEvent': return LayerKind.BRIGHTNESSCONTRAST;
                        case 'channelMixer': return LayerKind.CHANNELMIXER;
                        case 'curves': return LayerKind.CURVES;
                        case 'exposure': return LayerKind.EXPOSURE;

                        default:
                            // If none of the above, return adjustment kind as string
                            return adjustmentKind;
                    }
                }

                // If we get here normal should be the only choice left
                return LayerKind.NORMAL;
            },
            set: false,
        },

        'bounds': {
            typeId: stringIDToTypeID('bounds'),
            type: DescValueType.OBJECTTYPE,
            get: function (prop, layerId, desc)
            {
                var bounds = desc.getObjectValue(prop.typeId);

                // LayerBounds seems to be always saved in pixels,
                // but unit is loaded from document anyways
                return new LayerBounds(
                        bounds.getUnitDoubleValue(charIDToTypeID('Top ')),
                        bounds.getUnitDoubleValue(charIDToTypeID('Left')),
                        bounds.getUnitDoubleValue(charIDToTypeID('Btom')),
                        bounds.getUnitDoubleValue(charIDToTypeID('Rght')),
                        bounds.getUnitDoubleType(charIDToTypeID('Top '))
                    );
            },
            set: false,
        },

        'group': { typeId: charIDToTypeID('Grup'), type: DescValueType.BOOLEANTYPE, set: false, },

        'hasLayerMask': { typeId: stringIDToTypeID('hasUserMask'), type: DescValueType.BOOLEANTYPE, set: false, },

        'layerMaskDensity': {
            typeId: stringIDToTypeID('userMaskDensity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(100.0, '%'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to get layer mask density: layer does not have a layer mask applied.');

                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to set layer mask density: layer does not have a layer mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'layerMaskFeather': {
            typeId: stringIDToTypeID('userMaskFeather'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(0.0, 'px'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to get layer mask feather: layer does not have a layer mask applied.');

                return desc.getUnitDoubleValue(prop.typeId);
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasLayerMask'))
                    throw new Error('Unable to set layer mask feather: layer does not have a layer mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Pxl'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'hasVectorMask': { typeId: stringIDToTypeID('hasVectorMask'), type: DescValueType.BOOLEANTYPE, set: false, },

        'vectorMaskDensity': {
            typeId: stringIDToTypeID('vectorMaskDensity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(100.0, '%'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to get vector mask density: layer does not have a vector mask applied.');

                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to set vector mask density: layer does not have a vector mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'vectorMaskFeather': {
            typeId: stringIDToTypeID('vectorMaskFeather'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(0.0, 'px'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to get vector mask feather: layer does not have a vector mask applied.');

                return desc.getUnitDoubleValue(prop.typeId);
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasVectorMask'))
                    throw new Error('Unable to set vector mask feather: layer does not have a vector mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Pxl'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'hasFilterMask': { typeId: stringIDToTypeID('hasFilterMask'), type: DescValueType.BOOLEANTYPE, set: false, },

        'filterMaskDensity': {
            typeId: stringIDToTypeID('filterMaskDensity'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(100.0, '%'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to get filter mask density: layer does not have a filter mask applied.');

                return _byteToPercent(desc.getInteger(prop.typeId));
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to set filter mask density: layer does not have a filter mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Prc'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'filterMaskFeather': {
            typeId: stringIDToTypeID('filterMaskFeather'),
            type: DescValueType.UNITDOUBLE,
            defaultValue: new UnitValue(0.0, 'px'),
            get: function (prop, layerId, desc)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to get filter mask feather: layer does not have a layer mask applied.');

                return desc.getUnitDoubleValue(prop.typeId);
            },
            set: function (prop, layerId, value)
            {
                if (!layers.prop(layerId, 'hasFilterMask'))
                    throw new Error('Unable to set filter mask feather: layer does not have a filter mask applied.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);
                var desc2 = new ActionDescriptor();
                desc2.putUnitDouble(prop.typeId, charIDToTypeID('#Pxl'), value);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'allLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectAll'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                {
                    if (value)
                    {
                        // We tried to lock the background layer, throw error
                        throw new Error('Unable to set lock on background layer.');
                    }
                    else
                    {
                        // We tried to unlock the background layer, let's make it a normal layer (this changes active layer)
                        _wrapSwitchActive(layerId, layers.makeLayerFromBackground);
                    }
                }
                else
                {
                    // Target layer must be active to change its lock
                    _wrapSwitchActive(layerId, function ()
                    {
                        var ref = new ActionReference();
                        _getLayerIdRef(layerId, ref);
                        var desc = new ActionDescriptor();
                        desc.putReference(charIDToTypeID('null'), ref);

                        // Set lock object
                        var lock = new ActionDescriptor();
                        lock.putBoolean(stringIDToTypeID('protectAll'), value);

                        var desc2 = new ActionDescriptor();
                        desc2.putObject(prop.typeId, prop.typeId, lock);
                        desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
                    });
                }
            },
        },

        'pixelsLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectComposite'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set pixels lock on background layer.');

                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Pixels lock can not be set on layer sets.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);

                // Set lock object
                var lock = new ActionDescriptor();
                lock.putBoolean(stringIDToTypeID('protectComposite'), value);

                var desc2 = new ActionDescriptor();
                desc2.putObject(prop.typeId, prop.typeId, lock);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'positionLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectPosition'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set position lock on background layer.');

                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Position lock can not be set on layer sets.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);

                // Set lock object
                var lock = new ActionDescriptor();
                lock.putBoolean(stringIDToTypeID('protectPosition'), value);

                var desc2 = new ActionDescriptor();
                desc2.putObject(prop.typeId, prop.typeId, lock);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'transparentPixelsLocked': {
            typeId: stringIDToTypeID('layerLocking'),
            type: DescValueType.BOOLEANTYPE,
            defaultValue: false,
            get: function (prop, layerId, desc)
            {
                return desc.getObjectValue(prop.typeId).getBoolean(stringIDToTypeID('protectTransparency'));
            },
            set: function (prop, layerId, value)
            {
                if (layers.prop(layerId, 'isBackgroundLayer'))
                    throw new Error('Unable to set transparency lock on background layer.');

                if (layers.prop(layerId, 'type') !== LayerType.CONTENT)
                    throw new Error('Transparency lock can not be set on layer sets.');

                var ref = new ActionReference();
                _getLayerIdRef(layerId, ref);
                var desc = new ActionDescriptor();
                desc.putReference(charIDToTypeID('null'), ref);

                // Set lock object
                var lock = new ActionDescriptor();
                lock.putBoolean(stringIDToTypeID('protectTransparency'), value);

                var desc2 = new ActionDescriptor();
                desc2.putObject(prop.typeId, prop.typeId, lock);
                desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2);
                executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
            },
        },

        'isBackgroundLayer': {
            typeId: charIDToTypeID('Bckg'),
            type: DescValueType.BOOLEANTYPE,
            get: function (prop, layerId, desc)
            {
                return layerId === 0 || desc.getBoolean(prop.typeId);
            },
            set: false,
        },

        'xmpMetadata': { typeId: stringIDToTypeID('metadata'), type: DescValueType.OBJECTTYPE, set: false, },

        'lastModified': {
            typeId: stringIDToTypeID('metadata'), // lastModified is a child of xmpMetadata
            type: DescValueType.DOUBLETYPE,
            get: function (prop, layerId, desc)
            {
                var lastModified = new Date();
                lastModified.setTime(desc.getObjectValue(prop.typeId).getDouble(stringIDToTypeID('layerTime')) * 1000.0); // Time is stored in seconds
                return lastModified;
            },
            set: false,
        },
    };

    /** 
     * Gets the number of layers contained in the currently active document.
     * Please note: layer count will be zero if *only* the background layer is present in the document.
     * @return Layer count of the currently active document.
     */
    layers.count = function ()
    {
        if (_cache.hasOwnProperty('layerCount'))
            return _cache['layerCount'];

        // Get base count
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('NmbL'));
        ref.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
        var count = executeActionGet(ref).getInteger(charIDToTypeID('NmbL'));

        // If document has background, add 1 to layer count
        if (count > 0)
        {
            if (_cache.hasOwnProperty('hasBackground'))
            {
                if (_cache['hasBackground'])
                    count++;
            }
            else
            {
                ref = new ActionReference();
                ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Bckg'));
                ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Back'));
                if (executeActionGet(ref).getBoolean(charIDToTypeID('Bckg')))
                    count++;
            }
        }

        return count;
    };

    /**
     * Gets the LayerId of the layer identified by the passed ItemIndex.
     * @return {Number} LayerId of the specified layer.
     */
    layers.getLayerIdByItemIndex = function (itemIndex)
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('LyrI'));
        _getItemIndexRef(itemIndex, ref);
        return executeActionGet(ref).getInteger(charIDToTypeID('LyrI'));
    };

    /**
     * Gets whether a background layer currently exists.
     * @return {Boolean} True if a background layer is currently existing; otherwise, false.
     */
    layers.hasBackground = function ()
    {
        if (_cache.hasOwnProperty('hasBackground'))
            return _cache['hasBackground'];

        if (Lifter.layers.count() === 0)
        {
            // Layer count will be zero if *only* the background layer is
            // present in document
            return true;
        }
        else
        {
            var ref = new ActionReference();
            ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Bckg'));
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Back'));
            return executeActionGet(ref).getBoolean(charIDToTypeID('Bckg'));
        }
    };

    /** 
     * Adds a new layer to the currently active document.
     * @param {String} [name] Layer name. Pass null for default value.
     * @param {String} [opacity] Layer opacity. Pass null for default value.
     * @param {BlendMode, LifterBlendMode} blendMode Layer blend mode. Pass null for default value.
     * @param {LayerColor} color Layer color. Pass null for default value.
     * @return Chained reference to layer utilities.
     */
    layers.add = function (name, opacity, blendMode, color)
    {
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID('Lyr '));
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putObject(charIDToTypeID('Usng'), charIDToTypeID('Lyr '), _getMakeLayerDescriptor(name, opacity, blendMode, color));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Adds a new layer set to the currently active document.
     * @param {String} [name] Layer set name. Pass null for default value.
     * @param {String} [opacity] Layer set opacity. Pass null for default value.
     * @param {BlendMode, LifterBlendMode} blendMode Layer set blend mode. Pass null for default value.
     * @param {LayerColor} color Layer set color. Pass null for default value.
     * @return Chained reference to layer utilities.
     */
    layers.addLayerSet = function (name, opacity, blendMode, color)
    {
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID('layerSection'));
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putObject(charIDToTypeID('Usng'), stringIDToTypeID('layerSection'), _getMakeLayerDescriptor(name, opacity, blendMode, color));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Removes the specified layer from the currently active document.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.remove = function (layerId)
    {
        var ref = new ActionReference();
        _getLayerIdRef(layerId, ref);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Transforms the background of the current document in a normal layer.
     * @param {String} [name] Layer set name. Pass null for default value.
     * @param {String} [opacity] Layer set opacity. Pass null for default value.
     * @param {BlendMode, LifterBlendMode} blendMode Layer set blend mode. Pass null for default value.
     * @param {LayerColor} color Layer set color. Pass null for default value.
     * @return Chained reference to layer utilities.
     */
    layers.makeLayerFromBackground = function (name, opacity, blendMode, color)
    {
        // Do nothing if we do not have a background
        if (!Lifter.layers.hasBackground())
            return;

        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Lyr '), charIDToTypeID('Bckg'));
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putObject(charIDToTypeID('T   '), charIDToTypeID('Lyr '), _getMakeLayerDescriptor(name, opacity, blendMode, color));
        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
    };

    /**
     * Converts the specified layer to a smart object and makes it active.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.convertToSmartObject = function (layerId)
    {
        if (typeof layerId === 'number')
            layers.stack.makeActive(layerId);

        executeAction(stringIDToTypeID('newPlacedLayer'), undefined, _dialogModesNo);
        return layers;
    };

    /**
     * Duplicates the specified layer into the specified document.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Number} [documentId] Identifier of the document to copy the specified layer into. Defaults
     *                              to current document if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.duplicate = function (layerId, documentId)
    {
        var ref = new ActionReference();
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);

        if (documentId)
        {
            var ref2 = new ActionReference();
            ref.putIdentifier(charIDToTypeID('Dcmn'), documentId);
            desc.putReference(charIDToTypeID('T   '), ref2);
        }

        desc.putInteger(charIDToTypeID('Vrsn'), 5);
        executeAction(charIDToTypeID('Dplc'), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Applies the specified layer into another one.
     * @param {Number} [sourceDocumentId] Source document identifier, defaults to currently active document if null.
     * @param {Number} [sourceLayerId] Source layer identifier, defaults to currently active layer if null.
     * @param {ApplyImageChannel} [sourceLayerId=ApplyImageChannel.RGB] Source channel identifier.
     * @param {Boolean} [invert=false] Whether to invert the applied image.
     * @param {BlendMode, LifterBlendMode} [blendMode=LifterBlendMode.NORMAL] Blend mode.
     * @param {Number} [opacity=100] Blend opacity.
     * @param {Boolean} [preserveTransparency=true] Whether to preserve the transparency of the applied image.
     * @return Chained reference to layer utilities.
     */
    layers.applyImage = function (sourceDocumentId, sourceLayerId, sourceChannel, invert, blendMode, opacity, preserveTransparency)
    {
        if (!Lifter.documents)
            throw new Error('Lifter.layers.applyImage requires the Lifter.documents library.');

        // Validate parameters
        // Source document
        if (typeof sourceDocumentId !== 'number')
            sourceDocumentId = Lifter.documents.getActiveDocumentId();

        // Source layer
        if (sourceLayerId !== 'merged' && typeof sourceLayerId !== 'number')
            sourceLayerId = layers.stack.getActiveLayerId();

        // Source channel
        if (sourceChannel)
        {
            if (!Enumeration.contains(ApplyImageChannel, sourceChannel))
                throw new TypeError('Invalid sourceChannel:' + sourceChannel);
        }
        else
        {
            sourceChannel = ApplyImageChannel.RGB;
        }

        // Invert
        typeof invert === 'boolean' || (invert = false);

        // Blend mode
        (blendMode && blendMode.valueOf) || (blendMode = LifterBlendMode.NORMAL);
        blendMode = _ensureLifterBlendMode(blendMode);

        // Opacity and transparency
        opacity = +opacity || 100.0;
        typeof preserveTransparency === 'boolean' || (preserveTransparency = true);

        // Apply image
        // Source
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), sourceChannel.valueOf());

        if (sourceLayerId === 'merged')
        {
            ref.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Mrgd'));
        }
        else
        {
            // Check source document for background layer
            var activeDocId = Lifter.documents.getActiveDocumentId();
            Lifter.documents.makeActive(sourceDocId);

            if (layers.prop('isBackgroundLayer'))
                ref.putProperty(charIDToTypeID('Lyr '), charIDToTypeID('Bckg'));
            else
                ref.putIdentifier(charIDToTypeID('Lyr '), sourceLayerId);

            Lifter.documents.makeActive(activeDocId);
        }

        ref.putIdentifier(charIDToTypeID('Dcmn'), sourceDocumentId);

        var desc2 = new ActionDescriptor();
        desc2.putReference(charIDToTypeID('T   '), ref);
        desc2.putEnumerated(charIDToTypeID('Clcl'), charIDToTypeID('Clcn'), blendMode.valueOf());
        desc2.putUnitDouble(charIDToTypeID('Opct'), charIDToTypeID('#Prc'), opacity);
        desc2.putBoolean(charIDToTypeID('PrsT'), preserveTransparency);
        desc2.putBoolean(charIDToTypeID('Invr'), invert);

        var desc = new ActionDescriptor();
        desc.putObject(charIDToTypeID('With'), charIDToTypeID('Clcl'), desc2);

        executeAction(charIDToTypeID('AppI'), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Inverts the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.invert = function (layerId)
    {
        if (typeof layerId === 'number')
            layers.stack.makeActive(layerId);

        executeAction(charIDToTypeID('Invr'), undefined, _dialogModesNo);
        return layers;
    }

    /**
     * Applies the specified layer into another one.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null.
     * @param {SolidColor} [fillColor] Fill color, defaults to background color if null.
     * @param {BlendMode, LifterBlendMode} [blendMode=LifterBlendMode.NORMAL] Blend mode.
     * @param {Number} [opacity=100] Blend opacity.
     * @return Chained reference to layer utilities.
     */
    layers.fill = function (layerId, fillColor, blendMode, opacity)
    {
        if (typeof layerId === 'number')
            layers.stack.makeActive(layerId);

        // Color
        (fillColor) || (fillColor = app.backgroundColor);

        if (!(fillColor instanceof SolidColor))
            throw new Error('Fill color must be a valid SolidColor: ' + fillColor);

        // Blend mode
        (blendMode && blendMode.valueOf) || (blendMode = LifterBlendMode.NORMAL);
        blendMode = _ensureLifterBlendMode(blendMode);

        // Opacity
        opacity = +opacity || 100.0;

        // Apply fill
        var desc = new ActionDescriptor();
        desc.putEnumerated(charIDToTypeID('Usng'), charIDToTypeID('FlCn'), charIDToTypeID('Clr '));

        var desc2 = new ActionDescriptor();
        desc2.putUnitDouble(charIDToTypeID('H   '), charIDToTypeID('#Ang'), fillColor.hsb.hue);
        desc2.putDouble(charIDToTypeID('Strt'), fillColor.hsb.saturation);
        desc2.putDouble(charIDToTypeID('Brgh'), fillColor.hsb.brightness);
        desc.putObject(charIDToTypeID('Clr '), charIDToTypeID('HSBC'), desc2);

        desc.putUnitDouble(charIDToTypeID('Opct'), charIDToTypeID('#Prc'), opacity);
        desc.putEnumerated(charIDToTypeID('Md  '), charIDToTypeID('BlnM'), blendMode.valueOf());

        executeAction(charIDToTypeID('Fl  '), desc, _dialogModesNo);

        return layers;
    };

    /**
     * Iterates over all layers contained in the current document, executing the specified callback on each element.
     * Please note: this iterates over ALL layers, including '</Layer group>', etc. Adding or removing layers
     * while iterating is not supported.
     * @param {Function} callback       Callback function. It is bound to context and invoked with two arguments (itemIndex, layerId).
     *                                  If callback returns true, iteration is stopped.
     * @param {Object} [context=null]   Callback function context.
     * @param {Boolean} [reverse=false] Whether to iterate from the end of the layer collection.
     * @return Chained reference to layer utilities.
     */
    layers.forEach = function (callback, context, reverse)
    {
        if (typeof callback !== 'function')
            throw new Error('Callback must be a valid function.');

        var n, i;

        // Cache some information to speed up the operation
        _cache['hasBackground'] = layers.hasBackground();
        _cache['layerCount'] = layers.count();

        if (reverse)
        {
            i = _cache['layerCount'] + 1;
            n = 0;

            while (--i > n)
            {
                if (callback.call(context, i, layers.getLayerIdByItemIndex(i)))
                    break;
            }
        }
        else
        {
            n = _cache['layerCount'] + 1;
            i = 0;

            while (++i < n)
            {
                if (callback.call(context, i, layers.getLayerIdByItemIndex(i)))
                    break;
            }
        }

        // Cleanup cache
        delete _cache['hasBackground'];
        delete _cache['layerCount'];

        // Chaining
        return layers;
    };

    /**
     * Gets or sets the property with the given name on the specified layer. If invoked with no arguments
     * gets a wrapped ActionDescriptor containing all the properties of the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active document if null or not specified.
     * @param {String} [name] Property name.
     * @param {Any} [value] Property value.
     * @return {Any, ActionDescriptor, Object}  Property value when getting a property, a wrapped ActionDescriptor when invoked with no arguments
     *                                          or a chained reference to document utilities when setting a property.
     */
    layers.prop = function ()
    {
        // Parse args
        var layerId, name, value, ref, desc;

        if (typeof arguments[0] === 'number'
            || (!arguments[0] && arguments.length > 1))
        {
            layerId = arguments[0];
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
            _getLayerIdRef(layerId, ref);
            desc = executeActionGet(ref);
            return _getWrappedActionDescriptor(desc, layers.supportedProperties, layerId || desc.getInteger(charIDToTypeID('LyrI')));
        }
        else
        {
            // Find property
            if (!layers.supportedProperties.hasOwnProperty(name))
                throw new Error(['Invalid layer property: "', name, '".'].join(''));

            var prop = layers.supportedProperties[name];

            if (typeof value === 'undefined')
            {
                // Get
                // Get ActionDescriptor for specified layer
                ref = new ActionReference();

                if (prop.typeId)
                    ref.putProperty(charIDToTypeID('Prpr'), prop.typeId);

                _getLayerIdRef(layerId, ref);
                desc = executeActionGet(ref);

                if (prop.get)
                {
                    // Use custom getter for this property
                    return prop.get.call(null, prop, layerId, desc);
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
                    throw new Error(['Property "', name, '" is read-only.'].join(''));

                if (layers.prop(layerId, 'type') === LayerType.SETEND)
                    throw new Error(['Setting properties on a layer of type ', LayerType.SETEND.toString(), ' is not supported.'].join(''));

                // Set value
                prop.set.call(null, prop, layerId, value);

                // Chaining
                return layers;
            }
        }
    };

    /**
     * Finds all the layers that match the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Array} An array containing find results.
     */
    layers.findAll = _find.bind(null, layers, 0);

    /**
     * Finds the first layer that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    layers.findFirst = _find.bind(null, layers, 1);

    /**
     * Finds the last layer that matches the specified patterns.
     * @param {Object, Function} patterns Either an hash object specifying search criteria or a custom search function.
     * @param {Object} [context] Context applied to search function.
     * @return {Object} Matching object, or null if no match was found.
     */
    layers.findLast = _find.bind(null, layers, 2);


    // Stack
    /**
     * Provides methods to navigate across the layers stack.
     */
    layers.stack = {};

    /**
     * Gets the identifier of the currently active layer.
     * @return {Number} LayerId of the currently active layer.
     */
    layers.stack.getActiveLayerId = function ()
    {
        return layers.prop('layerId');
    };

    /**
     * Gets the identifier of the front layer.
     * @return {Number} LayerId of the front layer.
     */
    layers.stack.getFrontLayerId = _getStackId.bind(null, charIDToTypeID('Frnt'));

    /**
     * Gets the identifier of the bottom/background layer.
     * @return {Number} LayerId of the bottom layer.
     */
    layers.stack.getBottomLayerId = _getStackId.bind(null, charIDToTypeID('Back'));

    /**
     * Gets the identifier of the layer following the currently active one.
     * @return {Number} LayerId of the next layer.
     */
    layers.stack.getNextLayerId = _getStackId.bind(null, charIDToTypeID('Frwr'));

    /**
     * Gets the identifier of the layer preceding the currently active one.
     * @return {Number} LayerId of the previous layer.
     */
    layers.stack.getPreviousLayerId = _getStackId.bind(null, charIDToTypeID('Bckw'));

    /**
     * Sets the currently active layer to the one identified by the passed LayerId.
     * @param {Number} layerId Layer identifier.
     * @param {Boolean} [makeVisible] Whether to make the layer RGB channels visible.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeActive = function (layerId, makeVisible)
    {
        if (typeof layerId !== 'number' || layerId < 1)
            throw new Error('Invalid layerId: ' + layerId);

        typeof makeVisible === 'boolean' || (makeVisible = false);

        var ref = new ActionReference();
        ref.putIdentifier(charIDToTypeID('Lyr '), layerId);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('MkVs'), makeVisible);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Sets the currently active layer to the front layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeFrontActive = _traverseStack.bind(null, charIDToTypeID('Frnt'));

    /**
     * Sets the currently active layer to the bottom/background layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeBottomActive = _traverseStack.bind(null, charIDToTypeID('Back'));

    /**
     * Sets the currently active layer to the one following the currently active layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makeNextActive = _traverseStack.bind(null, charIDToTypeID('Frwr'));

    /**
     * Sets the currently active layer to the one preceding the currently active layer.
     * @return Chained reference to layer utilities.
     */
    layers.stack.makePreviousActive = _traverseStack.bind(null, charIDToTypeID('Bckw'));


    // Masks
    /**
     * Provides methods to work with masks on layer and layer sets.
     */
    layers.masks = {};

    /**
     * Adds a layer mask to the specified layer and makes it active.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.addLayerMask = function (layerId)
    {
        // Abort if layer already has a layer mask
        if (layers.prop(layerId, 'hasLayerMask'))
            throw new Error('Unable to add layer mask: layer already has one.');

        // Make layer if we're targeting background
        if (layers.prop(layerId, 'isBackgroundLayer'))
            layers.makeLayerFromBackground();

        // Make sure target layer is active
        layers.stack.makeActive(layerId);

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));

        var desc = new ActionDescriptor();
        desc.putClass(charIDToTypeID('Nw  '), charIDToTypeID('Chnl'));
        desc.putReference(charIDToTypeID('At  '), ref);
        desc.putEnumerated(charIDToTypeID('Usng'), charIDToTypeID('UsrM'), charIDToTypeID('RvlA'));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Adds a vector mask to the specified layer and makes it active.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.addVectorMask = function (layerId)
    {
        // Abort if layer already has a vector mask
        if (layers.prop(layerId, 'hasVectorMask'))
            throw new Error('Unable to add vector mask: layer already has one.');

        // Make layer if we're targeting background
        if (layers.prop(layerId, 'isBackgroundLayer'))
            layers.makeLayerFromBackground();

        // Make sure target layer is active
        layers.stack.makeActive(layerId);

        var ref = new ActionReference();
        ref.putClass(charIDToTypeID('Path'));

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);

        var ref2 = new ActionReference();
        ref2.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
        desc.putReference(charIDToTypeID('At  '), ref2);
        desc.putEnumerated(charIDToTypeID('Usng'), stringIDToTypeID('vectorMaskEnabled'), charIDToTypeID('RvlA'));
        executeAction(charIDToTypeID('Mk  '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Removes the layer mask from the specified layer, optionally applying it.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [apply] Whether to apply the mask to the layer.
     * @return Chained reference to layer utilities.
     */
    layers.masks.removeLayerMask = function ()
    {
        // Parse args
        var layerId, apply;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            apply = arguments[1] || false;
        }
        else
        {
            apply = arguments[0] || false;
        }

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('Aply'), apply);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Removes the vector mask from the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.removeVectorMask = function (layerId)
    {
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('Dlt '), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Refines the layer mask of the specified layer.
     * @param {Number} layerId Layer identifier, defaults to currently active layer if null.
     * @return Chained reference to layer utilities.
     */
    layers.masks.refineLayerMask = function (layerId, edgeBorderRadius, edgeBorderContrast, edgeSmooth, edgeFeatherRadius, edgeChoke, edgeAutoRadius, edgeDecontaminate)
    {
        // Parse args
        typeof edgeBorderRadius === 'number' || (edgeBorderRadius = 0.0);
        typeof edgeBorderContrast === 'number' || (edgeBorderContrast = 0.0);
        typeof edgeSmooth === 'number' || (edgeSmooth = 0);
        typeof edgeFeatherRadius === 'number' || (edgeFeatherRadius = 0.0);
        typeof edgeChoke === 'number' || (edgeChoke = 0.0);
        typeof edgeAutoRadius === 'boolean' || (edgeAutoRadius = false);
        typeof edgeDecontaminate === 'boolean' || (edgeDecontaminate = false);

        var ref = new ActionReference();
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);

        desc.putUnitDouble(stringIDToTypeID('refineEdgeBorderRadius'), charIDToTypeID('#Pxl'), Math.abs(edgeBorderRadius));
        desc.putUnitDouble(stringIDToTypeID('refineEdgeBorderContrast'), idPrc, Math.abs(edgeBorderContrast));
        desc.putInteger(stringIDToTypeID('refineEdgeSmooth'), Math.abs(Math.ceil(edgeSmooth)));
        desc.putUnitDouble(stringIDToTypeID('refineEdgeFeatherRadius'), charIDToTypeID('#Pxl'), Math.abs(edgeFeatherRadius));
        desc.putUnitDouble(stringIDToTypeID('refineEdgeChoke'), charIDToTypeID('#Prc'), Math.abs(edgeChoke));
        desc.putBoolean(stringIDToTypeID('refineEdgeAutoRadius'), edgeAutoRadius);
        desc.putBoolean(stringIDToTypeID('refineEdgeDecontaminate'), edgeDecontaminate);
        desc.putEnumerated(stringIDToTypeID('refineEdgeOutput'), stringIDToTypeID('refineEdgeOutput'), stringIDToTypeID('refineEdgeOutputUserMask'));
        executeAction(stringIDToTypeID('refineSelectionEdge'), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Makes the layer mask of the specified layer active so that drawing operations
     * can be performed on it.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [makeVisible] Whether to make the layer mask visible.
     * @return Chained reference to layer utilities.
     */
    layers.masks.makeLayerMaskActive = function ()
    {
        // Parse args
        var layerId, makeVisible;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            makeVisible = arguments[1] || false;
        }
        else
        {
            makeVisible = arguments[0] || false;
        }

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('MkVs'), makeVisible ? true : false);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Toggle whether the layer mask of the specified layer is active so that drawing operations
     * can be performed on it.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [active] Whether to make the vector mask active or inactive.
     * @return Chained reference to layer utilities.
     */
    layers.masks.makeVectorMaskActive = function ()
    {
        // Parse args
        var layerId, active, ref, desc;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            active = arguments[1] || false;
        }
        else
        {
            active = arguments[0] || false;
        }

        if (active)
        {
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
            _getLayerIdRef(layerId, ref);

            desc = new ActionDescriptor();
            desc.putReference(charIDToTypeID('null'), ref);
            executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);
        }
        else
        {
            ref = new ActionReference();
            ref.putClass(charIDToTypeID('Path'));
            _getLayerIdRef(layerId, ref);

            desc = new ActionDescriptor();
            desc.putReference(charIDToTypeID('null'), ref);
            executeAction(charIDToTypeID('Dslc'), desc, _dialogModesNo);
        }

        return layers;
    };

    /**
     * Makes the RGB channels of the specified layer active so that drawing operations
     * can be performed on them.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @param {Boolean} [makeVisible] Whether to make the RGB channels visible.
     * @return Chained reference to layer utilities.
     */
    layers.masks.makeRGBActive = function ()
    {
        // Parse args
        var layerId, makeVisible;

        if (typeof arguments[0] === 'number')
        {
            layerId = arguments[0];
            makeVisible = arguments[1] || false;
        }
        else
        {
            makeVisible = arguments[0] || false;
        }

        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('RGB '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putBoolean(charIDToTypeID('MkVs'), makeVisible);
        executeAction(charIDToTypeID('slct'), desc, _dialogModesNo);

        // Chaining
        return layers;
    };

    /**
     * Creates a selection from the layer mask of the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.selectLayerMask = function (layerId)
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel'));

        var ref2 = new ActionReference();
        ref2.putEnumerated(charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk '));
        _getLayerIdRef(layerId, ref);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putReference(charIDToTypeID('T   '), ref2);
        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
        return layers;
    };

    /**
     * Creates a selection from the vector mask of the specified layer.
     * @param {Number} [layerId] Layer identifier, defaults to currently active layer if null or not specified.
     * @return Chained reference to layer utilities.
     */
    layers.masks.selectVectorMask = function (layerId)
    {
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Chnl'), charIDToTypeID('fsel'));

        var ref2 = new ActionReference();
        ref2.putEnumerated(charIDToTypeID('Path'), charIDToTypeID('Path'), stringIDToTypeID('vectorMask'));
        _getLayerIdRef(layerId, ref2);

        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID('null'), ref);
        desc.putReference(charIDToTypeID('T   '), ref2);

        desc.putInteger(charIDToTypeID('Vrsn'), 1);
        desc.putBoolean(stringIDToTypeID('vectorMaskParams'), true);
        executeAction(charIDToTypeID('setd'), desc, _dialogModesNo);
        return layers;
    };


    // Public API
    /**
     * Contains low-level methods to work with layers without accessing Photoshop DOM.
     *
     * Layers are identified by two numbers in Photoshop: LayerId and ItemIndex.
     *
     *  - LayerId: progressive 1-based unique integer identifier that does not change when the document is
     *             modified, open, saved or closed. When a layer is deleted, its LayerId won't be re-assigned
     *             to new layers. Background LayerId is a special case and it's always '0' if only the background
     *             layer is present in the document.
     *  - ItemIndex: a 1-based integer index that depends on layer position in hierarchy. It changes every
     *               time the layer is moved.
     *
     * The functions below use LayerId to get a valid reference to a layer. LayerIds are easier to work
     * with than ItemIndexes because are unique and does not changed based on whether a background
     * layer is present in the document (see below).
     *
     * Some brief notes about ItemIndexes: they behave differently when the background layer
     * is present in the document:
     *
     *  - with background: 'Background' = 1, 'Layer 1' = 2 ('Background' accessed with 0, 'Layer 1' accessed with 1)
     *  - without background: 'Layer 0' = 1, 'Layer 1' = 2 ('Layer 0' accessed with 1, 'Layer 1' accessed with 2)
     *
     * Also, when *only* the background layer is present in the document, getting a
     * reference to it via ItemIndex results in an error: it must be get using
     * Lyr -> Ordn -> Trgt enumeration value. No special actions are required when only one
     * non-background layer is present in the document. This is true for LayerIds too.
     */
    Lifter.layers = layers;
}());

}).call($.global);