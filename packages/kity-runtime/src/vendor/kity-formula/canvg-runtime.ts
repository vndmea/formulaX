// @ts-nocheck

export function createCanvgRuntime() {
const target = globalThis as typeof globalThis & Window;
function RGBColor(color_string) {
        this.ok = false;
        if (color_string.charAt(0) == "#") {
            color_string = color_string.substr(1, 6);
        }
        color_string = color_string.replace(/ /g, "");
        color_string = color_string.toLowerCase();
        let simple_colors = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "00ffff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000000",
            blanchedalmond: "ffebcd",
            blue: "0000ff",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "00ffff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dodgerblue: "1e90ff",
            feldspar: "d19275",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "ff00ff",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgrey: "d3d3d3",
            lightgreen: "90ee90",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslateblue: "8470ff",
            lightslategray: "778899",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "00ff00",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "ff00ff",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370d8",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "d87093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            red: "ff0000",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            violetred: "d02090",
            wheat: "f5deb3",
            white: "ffffff",
            whitesmoke: "f5f5f5",
            yellow: "ffff00",
            yellowgreen: "9acd32"
        };
        for (let key in simple_colors) {
            if (color_string == key) {
                color_string = simple_colors[key];
            }
        }
        let color_defs = [ {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: [ "rgb(123, 234, 45)", "rgb(255,234,245)" ],
            process: function(bits) {
                return [ parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3]) ];
            }
        }, {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: [ "#00ff00", "336699" ],
            process: function(bits) {
                return [ parseInt(bits[1], 16), parseInt(bits[2], 16), parseInt(bits[3], 16) ];
            }
        }, {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: [ "#fb0", "f0f" ],
            process: function(bits) {
                return [ parseInt(bits[1] + bits[1], 16), parseInt(bits[2] + bits[2], 16), parseInt(bits[3] + bits[3], 16) ];
            }
        } ];
        for (let i = 0; i < color_defs.length; i++) {
            let re = color_defs[i].re;
            let processor = color_defs[i].process;
            let bits = re.exec(color_string);
            if (bits) {
                channels = processor(bits);
                this.r = channels[0];
                this.g = channels[1];
                this.b = channels[2];
                this.ok = true;
            }
        }
        this.r = this.r < 0 || isNaN(this.r) ? 0 : this.r > 255 ? 255 : this.r;
        this.g = this.g < 0 || isNaN(this.g) ? 0 : this.g > 255 ? 255 : this.g;
        this.b = this.b < 0 || isNaN(this.b) ? 0 : this.b > 255 ? 255 : this.b;
        this.toRGB = function() {
            return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
        };
        this.toHex = function() {
            let r = this.r.toString(16);
            let g = this.g.toString(16);
            let b = this.b.toString(16);
            if (r.length == 1) r = "0" + r;
            if (g.length == 1) g = "0" + g;
            if (b.length == 1) b = "0" + b;
            return "#" + r + g + b;
        };
        this.getHelpXML = function() {
            let examples = new Array();
            for (let i = 0; i < color_defs.length; i++) {
                let example = color_defs[i].example;
                for (let j = 0; j < example.length; j++) {
                    examples[examples.length] = example[j];
                }
            }
            for (let sc in simple_colors) {
                examples[examples.length] = sc;
            }
            let xml = document.createElement("ul");
            xml.setAttribute("id", "rgbcolor-examples");
            for (let i = 0; i < examples.length; i++) {
                try {
                    let list_item = document.createElement("li");
                    let list_color = new RGBColor(examples[i]);
                    let example_div = document.createElement("div");
                    example_div.style.cssText = "margin: 3px; " + "border: 1px solid black; " + "background:" + list_color.toHex() + "; " + "color:" + list_color.toHex();
                    example_div.appendChild(document.createTextNode("test"));
                    let list_item_value = document.createTextNode(" " + examples[i] + " -> " + list_color.toRGB() + " -> " + list_color.toHex());
                    list_item.appendChild(example_div);
                    list_item.appendChild(list_item_value);
                    xml.appendChild(list_item);
                } catch (e) {}
            }
            return xml;
        };
    }
    let mul_table = [ 512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259 ];
    let shg_table = [ 9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];
    function stackBlurImage(imageID, canvasID, radius, blurAlphaChannel) {
        let img = document.getElementById(imageID);
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        let canvas = document.getElementById(canvasID);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        canvas.width = w;
        canvas.height = h;
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, w, h);
        context.drawImage(img, 0, 0);
        if (isNaN(radius) || radius < 1) return;
        if (blurAlphaChannel) stackBlurCanvasRGBA(canvasID, 0, 0, w, h, radius); else stackBlurCanvasRGB(canvasID, 0, 0, w, h, radius);
    }
    function stackBlurCanvasRGBA(id, top_x, top_y, width, height, radius) {
        if (isNaN(radius) || radius < 1) return;
        radius |= 0;
        let canvas = document.getElementById(id);
        let context = canvas.getContext("2d");
        let imageData;
        try {
            try {
                imageData = context.getImageData(top_x, top_y, width, height);
            } catch (e) {
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                    imageData = context.getImageData(top_x, top_y, width, height);
                } catch (e) {
                    alert("Cannot access local image");
                    throw new Error("unable to access local image data: " + e);
                    return;
                }
            }
        } catch (e) {
            alert("Cannot access image");
            throw new Error("unable to access image data: " + e);
        }
        let pixels = imageData.data;
        let x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
        let div = radius + radius + 1;
        let w4 = width << 2;
        let widthMinus1 = width - 1;
        let heightMinus1 = height - 1;
        let radiusPlus1 = radius + 1;
        let sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
        let stackStart = new BlurStack();
        let stack = stackStart;
        let stackEnd = stackStart;
        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1) stackEnd = stack;
        }
        stack.next = stackStart;
        let stackIn = null;
        let stackOut = null;
        yw = yi = 0;
        let mul_sum = mul_table[radius];
        let shg_sum = shg_table[radius];
        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }
            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
                b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
                a_sum += (stack.a = pa = pixels[p + 3]) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;
                stack = stack.next;
            }
            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi + 3] = pa = a_sum * mul_sum >> shg_sum;
                if (pa != 0) {
                    pa = 255 / pa;
                    pixels[yi] = (r_sum * mul_sum >> shg_sum) * pa;
                    pixels[yi + 1] = (g_sum * mul_sum >> shg_sum) * pa;
                    pixels[yi + 2] = (b_sum * mul_sum >> shg_sum) * pa;
                } else {
                    pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                }
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;
                p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
                r_in_sum += stackIn.r = pixels[p];
                g_in_sum += stackIn.g = pixels[p + 1];
                b_in_sum += stackIn.b = pixels[p + 2];
                a_in_sum += stackIn.a = pixels[p + 3];
                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                a_sum += a_in_sum;
                stackIn = stackIn.next;
                r_out_sum += pr = stackOut.r;
                g_out_sum += pg = stackOut.g;
                b_out_sum += pb = stackOut.b;
                a_out_sum += pa = stackOut.a;
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;
                stackOut = stackOut.next;
                yi += 4;
            }
            yw += width;
        }
        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }
            yp = width;
            for (i = 1; i <= radius; i++) {
                yi = yp + x << 2;
                r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
                b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
                a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;
                stack = stack.next;
                if (i < heightMinus1) {
                    yp += width;
                }
            }
            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p + 3] = pa = a_sum * mul_sum >> shg_sum;
                if (pa > 0) {
                    pa = 255 / pa;
                    pixels[p] = (r_sum * mul_sum >> shg_sum) * pa;
                    pixels[p + 1] = (g_sum * mul_sum >> shg_sum) * pa;
                    pixels[p + 2] = (b_sum * mul_sum >> shg_sum) * pa;
                } else {
                    pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                }
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;
                p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
                r_sum += r_in_sum += stackIn.r = pixels[p];
                g_sum += g_in_sum += stackIn.g = pixels[p + 1];
                b_sum += b_in_sum += stackIn.b = pixels[p + 2];
                a_sum += a_in_sum += stackIn.a = pixels[p + 3];
                stackIn = stackIn.next;
                r_out_sum += pr = stackOut.r;
                g_out_sum += pg = stackOut.g;
                b_out_sum += pb = stackOut.b;
                a_out_sum += pa = stackOut.a;
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;
                stackOut = stackOut.next;
                yi += width;
            }
        }
        context.putImageData(imageData, top_x, top_y);
    }
    function stackBlurCanvasRGB(id, top_x, top_y, width, height, radius) {
        if (isNaN(radius) || radius < 1) return;
        radius |= 0;
        let canvas = document.getElementById(id);
        let context = canvas.getContext("2d");
        let imageData;
        try {
            try {
                imageData = context.getImageData(top_x, top_y, width, height);
            } catch (e) {
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                    imageData = context.getImageData(top_x, top_y, width, height);
                } catch (e) {
                    alert("Cannot access local image");
                    throw new Error("unable to access local image data: " + e);
                    return;
                }
            }
        } catch (e) {
            alert("Cannot access image");
            throw new Error("unable to access image data: " + e);
        }
        let pixels = imageData.data;
        let x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;
        let div = radius + radius + 1;
        let w4 = width << 2;
        let widthMinus1 = width - 1;
        let heightMinus1 = height - 1;
        let radiusPlus1 = radius + 1;
        let sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
        let stackStart = new BlurStack();
        let stack = stackStart;
        let stackEnd = stackStart;
        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1) stackEnd = stack;
        }
        stack.next = stackStart;
        let stackIn = null;
        let stackOut = null;
        yw = yi = 0;
        let mul_sum = mul_table[radius];
        let shg_sum = shg_table[radius];
        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack = stack.next;
            }
            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
                b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                stack = stack.next;
            }
            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi] = r_sum * mul_sum >> shg_sum;
                pixels[yi + 1] = g_sum * mul_sum >> shg_sum;
                pixels[yi + 2] = b_sum * mul_sum >> shg_sum;
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
                r_in_sum += stackIn.r = pixels[p];
                g_in_sum += stackIn.g = pixels[p + 1];
                b_in_sum += stackIn.b = pixels[p + 2];
                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                stackIn = stackIn.next;
                r_out_sum += pr = stackOut.r;
                g_out_sum += pg = stackOut.g;
                b_out_sum += pb = stackOut.b;
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                stackOut = stackOut.next;
                yi += 4;
            }
            yw += width;
        }
        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack = stack.next;
            }
            yp = width;
            for (i = 1; i <= radius; i++) {
                yi = yp + x << 2;
                r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
                b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                stack = stack.next;
                if (i < heightMinus1) {
                    yp += width;
                }
            }
            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p] = r_sum * mul_sum >> shg_sum;
                pixels[p + 1] = g_sum * mul_sum >> shg_sum;
                pixels[p + 2] = b_sum * mul_sum >> shg_sum;
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
                r_sum += r_in_sum += stackIn.r = pixels[p];
                g_sum += g_in_sum += stackIn.g = pixels[p + 1];
                b_sum += b_in_sum += stackIn.b = pixels[p + 2];
                stackIn = stackIn.next;
                r_out_sum += pr = stackOut.r;
                g_out_sum += pg = stackOut.g;
                b_out_sum += pb = stackOut.b;
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                stackOut = stackOut.next;
                yi += width;
            }
        }
        context.putImageData(imageData, top_x, top_y);
    }
    function BlurStack() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.next = null;
    }
    (function(global) {
        global.canvg = function(target, s, opts) {
            if (target == null && s == null && opts == null) {
                let svgTags = document.getElementsByTagName("svg");
                for (let i = 0; i < svgTags.length; i++) {
                    let svgTag = svgTags[i];
                    let c = document.createElement("canvas");
                    c.width = svgTag.clientWidth;
                    c.height = svgTag.clientHeight;
                    svgTag.parentNode.insertBefore(c, svgTag);
                    svgTag.parentNode.removeChild(svgTag);
                    let div = document.createElement("div");
                    div.appendChild(svgTag);
                    canvg(c, div.innerHTML);
                }
                return;
            }
            opts = opts || {};
            if (typeof target == "string") {
                target = document.getElementById(target);
            }
            if (target.svg != null) target.svg.stop();
            let svg = build();
            if (!(target.childNodes.length == 1 && target.childNodes[0].nodeName == "OBJECT")) target.svg = svg;
            svg.opts = opts;
            let ctx = target.getContext("2d");
            if (typeof s.documentElement != "undefined") {
                svg.loadXmlDoc(ctx, s);
            } else if (s.substr(0, 1) == "<") {
                svg.loadXml(ctx, s);
            } else {
                svg.load(ctx, s);
            }
        };
        function build() {
            let svg = {};
            svg.FRAMERATE = 30;
            svg.MAX_VIRTUAL_PIXELS = 3e4;
            svg.init = function(ctx) {
                let uniqueId = 0;
                svg.UniqueId = function() {
                    uniqueId++;
                    return "canvg" + uniqueId;
                };
                svg.Definitions = {};
                svg.Styles = {};
                svg.Animations = [];
                svg.Images = [];
                svg.ctx = ctx;
                svg.ViewPort = new function() {
                    this.viewPorts = [];
                    this.Clear = function() {
                        this.viewPorts = [];
                    };
                    this.SetCurrent = function(width, height) {
                        this.viewPorts.push({
                            width: width,
                            height: height
                        });
                    };
                    this.RemoveCurrent = function() {
                        this.viewPorts.pop();
                    };
                    this.Current = function() {
                        return this.viewPorts[this.viewPorts.length - 1];
                    };
                    this.width = function() {
                        return this.Current().width;
                    };
                    this.height = function() {
                        return this.Current().height;
                    };
                    this.ComputeSize = function(d) {
                        if (d != null && typeof d == "number") return d;
                        if (d == "x") return this.width();
                        if (d == "y") return this.height();
                        return Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2);
                    };
                }();
            };
            svg.init();
            svg.ImagesLoaded = function() {
                for (let i = 0; i < svg.Images.length; i++) {
                    if (!svg.Images[i].loaded) return false;
                }
                return true;
            };
            svg.trim = function(s) {
                return s.replace(/^\s+|\s+$/g, "");
            };
            svg.compressSpaces = function(s) {
                return s.replace(/[\s\r\t\n]+/gm, " ");
            };
            svg.ajax = function(url) {
                let AJAX;
                if (window.XMLHttpRequest) {
                    AJAX = new XMLHttpRequest();
                } else {
                    AJAX = new ActiveXObject("Microsoft.XMLHTTP");
                }
                if (AJAX) {
                    AJAX.open("GET", url, false);
                    AJAX.send(null);
                    return AJAX.responseText;
                }
                return null;
            };
            svg.parseXml = function(xml) {
                if (window.DOMParser) {
                    let parser = new DOMParser();
                    return parser.parseFromString(xml, "text/xml");
                } else {
                    xml = xml.replace(/<!DOCTYPE svg[^>]*>/, "");
                    let xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(xml);
                    return xmlDoc;
                }
            };
            svg.Property = function(name, value) {
                this.name = name;
                this.value = value;
            };
            svg.Property.prototype.getValue = function() {
                return this.value;
            };
            svg.Property.prototype.hasValue = function() {
                return this.value != null && this.value !== "";
            };
            svg.Property.prototype.numValue = function() {
                if (!this.hasValue()) return 0;
                let n = parseFloat(this.value);
                if ((this.value + "").match(/%$/)) {
                    n = n / 100;
                }
                return n;
            };
            svg.Property.prototype.valueOrDefault = function(def) {
                if (this.hasValue()) return this.value;
                return def;
            };
            svg.Property.prototype.numValueOrDefault = function(def) {
                if (this.hasValue()) return this.numValue();
                return def;
            };
            svg.Property.prototype.addOpacity = function(opacity) {
                let newValue = this.value;
                if (opacity != null && opacity != "" && typeof this.value == "string") {
                    let color = new RGBColor(this.value);
                    if (color.ok) {
                        newValue = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + opacity + ")";
                    }
                }
                return new svg.Property(this.name, newValue);
            };
            svg.Property.prototype.getDefinition = function() {
                let name = this.value.match(/#([^\)'"]+)/);
                if (name) {
                    name = name[1];
                }
                if (!name) {
                    name = this.value;
                }
                return svg.Definitions[name];
            };
            svg.Property.prototype.isUrlDefinition = function() {
                return this.value.indexOf("url(") == 0;
            };
            svg.Property.prototype.getFillStyleDefinition = function(e, opacityProp) {
                let def = this.getDefinition();
                if (def != null && def.createGradient) {
                    return def.createGradient(svg.ctx, e, opacityProp);
                }
                if (def != null && def.createPattern) {
                    if (def.getHrefAttribute().hasValue()) {
                        let pt = def.attribute("patternTransform");
                        def = def.getHrefAttribute().getDefinition();
                        if (pt.hasValue()) {
                            def.attribute("patternTransform", true).value = pt.value;
                        }
                    }
                    return def.createPattern(svg.ctx, e);
                }
                return null;
            };
            svg.Property.prototype.getDPI = function(viewPort) {
                return 96;
            };
            svg.Property.prototype.getEM = function(viewPort) {
                let em = 12;
                let fontSize = new svg.Property("fontSize", svg.Font.Parse(svg.ctx.font).fontSize);
                if (fontSize.hasValue()) em = fontSize.toPixels(viewPort);
                return em;
            };
            svg.Property.prototype.getUnits = function() {
                let s = this.value + "";
                return s.replace(/[0-9\.\-]/g, "");
            };
            svg.Property.prototype.toPixels = function(viewPort, processPercent) {
                if (!this.hasValue()) return 0;
                let s = this.value + "";
                if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
                if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2;
                if (s.match(/px$/)) return this.numValue();
                if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1 / 72);
                if (s.match(/pc$/)) return this.numValue() * 15;
                if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
                if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
                if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
                if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
                let n = this.numValue();
                if (processPercent && n < 1) return n * svg.ViewPort.ComputeSize(viewPort);
                return n;
            };
            svg.Property.prototype.toMilliseconds = function() {
                if (!this.hasValue()) return 0;
                let s = this.value + "";
                if (s.match(/s$/)) return this.numValue() * 1e3;
                if (s.match(/ms$/)) return this.numValue();
                return this.numValue();
            };
            svg.Property.prototype.toRadians = function() {
                if (!this.hasValue()) return 0;
                let s = this.value + "";
                if (s.match(/deg$/)) return this.numValue() * (Math.PI / 180);
                if (s.match(/grad$/)) return this.numValue() * (Math.PI / 200);
                if (s.match(/rad$/)) return this.numValue();
                return this.numValue() * (Math.PI / 180);
            };
            svg.Font = new function() {
                this.Styles = "normal|italic|oblique|inherit";
                this.Variants = "normal|small-caps|inherit";
                this.Weights = "normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit";
                this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
                    let f = inherit != null ? this.Parse(inherit) : this.CreateFont("", "", "", "", "", svg.ctx.font);
                    return {
                        fontFamily: fontFamily || f.fontFamily,
                        fontSize: fontSize || f.fontSize,
                        fontStyle: fontStyle || f.fontStyle,
                        fontWeight: fontWeight || f.fontWeight,
                        fontVariant: fontVariant || f.fontVariant,
                        toString: function() {
                            return [ this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily ].join(" ");
                        }
                    };
                };
                let that = this;
                this.Parse = function(s) {
                    let f = {};
                    let d = svg.trim(svg.compressSpaces(s || "")).split(" ");
                    let set = {
                        fontSize: false,
                        fontStyle: false,
                        fontWeight: false,
                        fontVariant: false
                    };
                    let ff = "";
                    for (let i = 0; i < d.length; i++) {
                        if (!set.fontStyle && that.Styles.indexOf(d[i]) != -1) {
                            if (d[i] != "inherit") f.fontStyle = d[i];
                            set.fontStyle = true;
                        } else if (!set.fontVariant && that.Variants.indexOf(d[i]) != -1) {
                            if (d[i] != "inherit") f.fontVariant = d[i];
                            set.fontStyle = set.fontVariant = true;
                        } else if (!set.fontWeight && that.Weights.indexOf(d[i]) != -1) {
                            if (d[i] != "inherit") f.fontWeight = d[i];
                            set.fontStyle = set.fontVariant = set.fontWeight = true;
                        } else if (!set.fontSize) {
                            if (d[i] != "inherit") f.fontSize = d[i].split("/")[0];
                            set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = true;
                        } else {
                            if (d[i] != "inherit") ff += d[i];
                        }
                    }
                    if (ff != "") f.fontFamily = ff;
                    return f;
                };
            }();
            svg.ToNumberArray = function(s) {
                let a = svg.trim(svg.compressSpaces((s || "").replace(/,/g, " "))).split(" ");
                for (let i = 0; i < a.length; i++) {
                    a[i] = parseFloat(a[i]);
                }
                return a;
            };
            svg.Point = function(x, y) {
                this.x = x;
                this.y = y;
            };
            svg.Point.prototype.angleTo = function(p) {
                return Math.atan2(p.y - this.y, p.x - this.x);
            };
            svg.Point.prototype.applyTransform = function(v) {
                let xp = this.x * v[0] + this.y * v[2] + v[4];
                let yp = this.x * v[1] + this.y * v[3] + v[5];
                this.x = xp;
                this.y = yp;
            };
            svg.CreatePoint = function(s) {
                let a = svg.ToNumberArray(s);
                return new svg.Point(a[0], a[1]);
            };
            svg.CreatePath = function(s) {
                let a = svg.ToNumberArray(s);
                let path = [];
                for (let i = 0; i < a.length; i += 2) {
                    path.push(new svg.Point(a[i], a[i + 1]));
                }
                return path;
            };
            svg.BoundingBox = function(x1, y1, x2, y2) {
                this.x1 = Number.NaN;
                this.y1 = Number.NaN;
                this.x2 = Number.NaN;
                this.y2 = Number.NaN;
                this.x = function() {
                    return this.x1;
                };
                this.y = function() {
                    return this.y1;
                };
                this.width = function() {
                    return this.x2 - this.x1;
                };
                this.height = function() {
                    return this.y2 - this.y1;
                };
                this.addPoint = function(x, y) {
                    if (x != null) {
                        if (isNaN(this.x1) || isNaN(this.x2)) {
                            this.x1 = x;
                            this.x2 = x;
                        }
                        if (x < this.x1) this.x1 = x;
                        if (x > this.x2) this.x2 = x;
                    }
                    if (y != null) {
                        if (isNaN(this.y1) || isNaN(this.y2)) {
                            this.y1 = y;
                            this.y2 = y;
                        }
                        if (y < this.y1) this.y1 = y;
                        if (y > this.y2) this.y2 = y;
                    }
                };
                this.addX = function(x) {
                    this.addPoint(x, null);
                };
                this.addY = function(y) {
                    this.addPoint(null, y);
                };
                this.addBoundingBox = function(bb) {
                    this.addPoint(bb.x1, bb.y1);
                    this.addPoint(bb.x2, bb.y2);
                };
                this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
                    let cp1x = p0x + 2 / 3 * (p1x - p0x);
                    let cp1y = p0y + 2 / 3 * (p1y - p0y);
                    let cp2x = cp1x + 1 / 3 * (p2x - p0x);
                    let cp2y = cp1y + 1 / 3 * (p2y - p0y);
                    this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
                };
                this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
                    let p0 = [ p0x, p0y ], p1 = [ p1x, p1y ], p2 = [ p2x, p2y ], p3 = [ p3x, p3y ];
                    this.addPoint(p0[0], p0[1]);
                    this.addPoint(p3[0], p3[1]);
                    for (i = 0; i <= 1; i++) {
                        let f = function(t) {
                            return Math.pow(1 - t, 3) * p0[i] + 3 * Math.pow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * Math.pow(t, 2) * p2[i] + Math.pow(t, 3) * p3[i];
                        };
                        let b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
                        let a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
                        let c = 3 * p1[i] - 3 * p0[i];
                        if (a == 0) {
                            if (b == 0) continue;
                            let t = -c / b;
                            if (0 < t && t < 1) {
                                if (i == 0) this.addX(f(t));
                                if (i == 1) this.addY(f(t));
                            }
                            continue;
                        }
                        let b2ac = Math.pow(b, 2) - 4 * c * a;
                        if (b2ac < 0) continue;
                        let t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
                        if (0 < t1 && t1 < 1) {
                            if (i == 0) this.addX(f(t1));
                            if (i == 1) this.addY(f(t1));
                        }
                        let t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
                        if (0 < t2 && t2 < 1) {
                            if (i == 0) this.addX(f(t2));
                            if (i == 1) this.addY(f(t2));
                        }
                    }
                };
                this.isPointInBox = function(x, y) {
                    return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2;
                };
                this.addPoint(x1, y1);
                this.addPoint(x2, y2);
            };
            svg.Transform = function(v) {
                let that = this;
                this.Type = {};
                this.Type.translate = function(s) {
                    this.p = svg.CreatePoint(s);
                    this.apply = function(ctx) {
                        ctx.translate(this.p.x || 0, this.p.y || 0);
                    };
                    this.unapply = function(ctx) {
                        ctx.translate(-1 * this.p.x || 0, -1 * this.p.y || 0);
                    };
                    this.applyToPoint = function(p) {
                        p.applyTransform([ 1, 0, 0, 1, this.p.x || 0, this.p.y || 0 ]);
                    };
                };
                this.Type.rotate = function(s) {
                    let a = svg.ToNumberArray(s);
                    this.angle = new svg.Property("angle", a[0]);
                    this.cx = a[1] || 0;
                    this.cy = a[2] || 0;
                    this.apply = function(ctx) {
                        ctx.translate(this.cx, this.cy);
                        ctx.rotate(this.angle.toRadians());
                        ctx.translate(-this.cx, -this.cy);
                    };
                    this.unapply = function(ctx) {
                        ctx.translate(this.cx, this.cy);
                        ctx.rotate(-1 * this.angle.toRadians());
                        ctx.translate(-this.cx, -this.cy);
                    };
                    this.applyToPoint = function(p) {
                        let a = this.angle.toRadians();
                        p.applyTransform([ 1, 0, 0, 1, this.p.x || 0, this.p.y || 0 ]);
                        p.applyTransform([ Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0 ]);
                        p.applyTransform([ 1, 0, 0, 1, -this.p.x || 0, -this.p.y || 0 ]);
                    };
                };
                this.Type.scale = function(s) {
                    this.p = svg.CreatePoint(s);
                    this.apply = function(ctx) {
                        ctx.scale(this.p.x || 1, this.p.y || this.p.x || 1);
                    };
                    this.unapply = function(ctx) {
                        ctx.scale(1 / this.p.x || 1, 1 / this.p.y || this.p.x || 1);
                    };
                    this.applyToPoint = function(p) {
                        p.applyTransform([ this.p.x || 0, 0, 0, this.p.y || 0, 0, 0 ]);
                    };
                };
                this.Type.matrix = function(s) {
                    this.m = svg.ToNumberArray(s);
                    this.apply = function(ctx) {
                        ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5]);
                    };
                    this.applyToPoint = function(p) {
                        p.applyTransform(this.m);
                    };
                };
                this.Type.SkewBase = function(s) {
                    this.base = that.Type.matrix;
                    this.base(s);
                    this.angle = new svg.Property("angle", s);
                };
                this.Type.SkewBase.prototype = new this.Type.matrix();
                this.Type.skewX = function(s) {
                    this.base = that.Type.SkewBase;
                    this.base(s);
                    this.m = [ 1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0 ];
                };
                this.Type.skewX.prototype = new this.Type.SkewBase();
                this.Type.skewY = function(s) {
                    this.base = that.Type.SkewBase;
                    this.base(s);
                    this.m = [ 1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0 ];
                };
                this.Type.skewY.prototype = new this.Type.SkewBase();
                this.transforms = [];
                this.apply = function(ctx) {
                    for (let i = 0; i < this.transforms.length; i++) {
                        this.transforms[i].apply(ctx);
                    }
                };
                this.unapply = function(ctx) {
                    for (let i = this.transforms.length - 1; i >= 0; i--) {
                        this.transforms[i].unapply(ctx);
                    }
                };
                this.applyToPoint = function(p) {
                    for (let i = 0; i < this.transforms.length; i++) {
                        this.transforms[i].applyToPoint(p);
                    }
                };
                let data = svg.trim(svg.compressSpaces(v)).replace(/\)(\s?,\s?)/g, ") ").split(/\s(?=[a-z])/);
                for (let i = 0; i < data.length; i++) {
                    let type = svg.trim(data[i].split("(")[0]);
                    let s = data[i].split("(")[1].replace(")", "");
                    let transform = new this.Type[type](s);
                    transform.type = type;
                    this.transforms.push(transform);
                }
            };
            svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
                aspectRatio = svg.compressSpaces(aspectRatio);
                aspectRatio = aspectRatio.replace(/^defer\s/, "");
                let align = aspectRatio.split(" ")[0] || "xMidYMid";
                let meetOrSlice = aspectRatio.split(" ")[1] || "meet";
                let scaleX = width / desiredWidth;
                let scaleY = height / desiredHeight;
                let scaleMin = Math.min(scaleX, scaleY);
                let scaleMax = Math.max(scaleX, scaleY);
                if (meetOrSlice == "meet") {
                    desiredWidth *= scaleMin;
                    desiredHeight *= scaleMin;
                }
                if (meetOrSlice == "slice") {
                    desiredWidth *= scaleMax;
                    desiredHeight *= scaleMax;
                }
                refX = new svg.Property("refX", refX);
                refY = new svg.Property("refY", refY);
                if (refX.hasValue() && refY.hasValue()) {
                    ctx.translate(-scaleMin * refX.toPixels("x"), -scaleMin * refY.toPixels("y"));
                } else {
                    if (align.match(/^xMid/) && (meetOrSlice == "meet" && scaleMin == scaleY || meetOrSlice == "slice" && scaleMax == scaleY)) ctx.translate(width / 2 - desiredWidth / 2, 0);
                    if (align.match(/YMid$/) && (meetOrSlice == "meet" && scaleMin == scaleX || meetOrSlice == "slice" && scaleMax == scaleX)) ctx.translate(0, height / 2 - desiredHeight / 2);
                    if (align.match(/^xMax/) && (meetOrSlice == "meet" && scaleMin == scaleY || meetOrSlice == "slice" && scaleMax == scaleY)) ctx.translate(width - desiredWidth, 0);
                    if (align.match(/YMax$/) && (meetOrSlice == "meet" && scaleMin == scaleX || meetOrSlice == "slice" && scaleMax == scaleX)) ctx.translate(0, height - desiredHeight);
                }
                if (align == "none") ctx.scale(scaleX, scaleY); else if (meetOrSlice == "meet") ctx.scale(scaleMin, scaleMin); else if (meetOrSlice == "slice") ctx.scale(scaleMax, scaleMax);
                ctx.translate(minX == null ? 0 : -minX, minY == null ? 0 : -minY);
            };
            svg.Element = {};
            svg.EmptyProperty = new svg.Property("EMPTY", "");
            svg.Element.ElementBase = function(node) {
                this.attributes = {};
                this.styles = {};
                this.children = [];
                this.attribute = function(name, createIfNotExists) {
                    let a = this.attributes[name];
                    if (a != null) return a;
                    if (createIfNotExists == true) {
                        a = new svg.Property(name, "");
                        this.attributes[name] = a;
                    }
                    return a || svg.EmptyProperty;
                };
                this.getHrefAttribute = function() {
                    for (let a in this.attributes) {
                        if (a.match(/:href$/)) {
                            return this.attributes[a];
                        }
                    }
                    return svg.EmptyProperty;
                };
                this.style = function(name, createIfNotExists) {
                    let s = this.styles[name];
                    if (s != null) return s;
                    let a = this.attribute(name);
                    if (a != null && a.hasValue()) {
                        this.styles[name] = a;
                        return a;
                    }
                    let p = this.parent;
                    if (p != null) {
                        let ps = p.style(name);
                        if (ps != null && ps.hasValue()) {
                            return ps;
                        }
                    }
                    if (createIfNotExists == true) {
                        s = new svg.Property(name, "");
                        this.styles[name] = s;
                    }
                    return s || svg.EmptyProperty;
                };
                this.render = function(ctx) {
                    if (this.style("display").value == "none") return;
                    if (this.attribute("visibility").value == "hidden") return;
                    ctx.save();
                    if (this.attribute("mask").hasValue()) {
                        let mask = this.attribute("mask").getDefinition();
                        if (mask != null) mask.apply(ctx, this);
                    } else if (this.style("filter").hasValue()) {
                        let filter = this.style("filter").getDefinition();
                        if (filter != null) filter.apply(ctx, this);
                    } else {
                        this.setContext(ctx);
                        this.renderChildren(ctx);
                        this.clearContext(ctx);
                    }
                    ctx.restore();
                };
                this.setContext = function(ctx) {};
                this.clearContext = function(ctx) {};
                this.renderChildren = function(ctx) {
                    for (let i = 0; i < this.children.length; i++) {
                        this.children[i].render(ctx);
                    }
                };
                this.addChild = function(childNode, create) {
                    let child = childNode;
                    if (create) child = svg.CreateElement(childNode);
                    child.parent = this;
                    this.children.push(child);
                };
                if (node != null && node.nodeType == 1) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        let childNode = node.childNodes[i];
                        if (childNode.nodeType == 1) this.addChild(childNode, true);
                        if (this.captureTextNodes && childNode.nodeType == 3) {
                            let text = childNode.nodeValue || childNode.text || "";
                            if (svg.trim(svg.compressSpaces(text)) != "") {
                                this.addChild(new svg.Element.tspan(childNode), false);
                            }
                        }
                    }
                    for (let i = 0; i < node.attributes.length; i++) {
                        let attribute = node.attributes[i];
                        this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue);
                    }
                    let styles = svg.Styles[node.nodeName];
                    if (styles != null) {
                        for (let name in styles) {
                            this.styles[name] = styles[name];
                        }
                    }
                    if (this.attribute("class").hasValue()) {
                        let classes = svg.compressSpaces(this.attribute("class").value).split(" ");
                        for (let j = 0; j < classes.length; j++) {
                            styles = svg.Styles["." + classes[j]];
                            if (styles != null) {
                                for (let name in styles) {
                                    this.styles[name] = styles[name];
                                }
                            }
                            styles = svg.Styles[node.nodeName + "." + classes[j]];
                            if (styles != null) {
                                for (let name in styles) {
                                    this.styles[name] = styles[name];
                                }
                            }
                        }
                    }
                    if (this.attribute("id").hasValue()) {
                        let styles = svg.Styles["#" + this.attribute("id").value];
                        if (styles != null) {
                            for (let name in styles) {
                                this.styles[name] = styles[name];
                            }
                        }
                    }
                    if (this.attribute("style").hasValue()) {
                        let styles = this.attribute("style").value.split(";");
                        for (let i = 0; i < styles.length; i++) {
                            if (svg.trim(styles[i]) != "") {
                                let style = styles[i].split(":");
                                let name = svg.trim(style[0]);
                                let value = svg.trim(style[1]);
                                this.styles[name] = new svg.Property(name, value);
                            }
                        }
                    }
                    if (this.attribute("id").hasValue()) {
                        if (svg.Definitions[this.attribute("id").value] == null) {
                            svg.Definitions[this.attribute("id").value] = this;
                        }
                    }
                }
            };
            svg.Element.RenderedElementBase = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.setContext = function(ctx) {
                    if (this.style("fill").isUrlDefinition()) {
                        let fs = this.style("fill").getFillStyleDefinition(this, this.style("fill-opacity"));
                        if (fs != null) ctx.fillStyle = fs;
                    } else if (this.style("fill").hasValue()) {
                        let fillStyle = this.style("fill");
                        if (fillStyle.value == "currentColor") fillStyle.value = this.style("color").value;
                        ctx.fillStyle = fillStyle.value == "none" ? "rgba(0,0,0,0)" : fillStyle.value;
                    }
                    if (this.style("fill-opacity").hasValue()) {
                        let fillStyle = new svg.Property("fill", ctx.fillStyle);
                        fillStyle = fillStyle.addOpacity(this.style("fill-opacity").value);
                        ctx.fillStyle = fillStyle.value;
                    }
                    if (this.style("stroke").isUrlDefinition()) {
                        let fs = this.style("stroke").getFillStyleDefinition(this, this.style("stroke-opacity"));
                        if (fs != null) ctx.strokeStyle = fs;
                    } else if (this.style("stroke").hasValue()) {
                        let strokeStyle = this.style("stroke");
                        if (strokeStyle.value == "currentColor") strokeStyle.value = this.style("color").value;
                        ctx.strokeStyle = strokeStyle.value == "none" ? "rgba(0,0,0,0)" : strokeStyle.value;
                    }
                    if (this.style("stroke-opacity").hasValue()) {
                        let strokeStyle = new svg.Property("stroke", ctx.strokeStyle);
                        strokeStyle = strokeStyle.addOpacity(this.style("stroke-opacity").value);
                        ctx.strokeStyle = strokeStyle.value;
                    }
                    if (this.style("stroke-width").hasValue()) {
                        let newLineWidth = this.style("stroke-width").toPixels();
                        ctx.lineWidth = newLineWidth == 0 ? .001 : newLineWidth;
                    }
                    if (this.style("stroke-linecap").hasValue()) ctx.lineCap = this.style("stroke-linecap").value;
                    if (this.style("stroke-linejoin").hasValue()) ctx.lineJoin = this.style("stroke-linejoin").value;
                    if (this.style("stroke-miterlimit").hasValue()) ctx.miterLimit = this.style("stroke-miterlimit").value;
                    if (this.style("stroke-dasharray").hasValue()) {
                        let gaps = svg.ToNumberArray(this.style("stroke-dasharray").value);
                        if (typeof ctx.setLineDash != "undefined") {
                            ctx.setLineDash(gaps);
                        } else if (typeof ctx.webkitLineDash != "undefined") {
                            ctx.webkitLineDash = gaps;
                        } else if (typeof ctx.mozDash != "undefined") {
                            ctx.mozDash = gaps;
                        }
                        let offset = this.style("stroke-dashoffset").numValueOrDefault(1);
                        if (typeof ctx.lineDashOffset != "undefined") {
                            ctx.lineDashOffset = offset;
                        } else if (typeof ctx.webkitLineDashOffset != "undefined") {
                            ctx.webkitLineDashOffset = offset;
                        } else if (typeof ctx.mozDashOffset != "undefined") {
                            ctx.mozDashOffset = offset;
                        }
                    }
                    if (typeof ctx.font != "undefined") {
                        ctx.font = svg.Font.CreateFont(this.style("font-style").value, this.style("font-variant").value, this.style("font-weight").value, this.style("font-size").hasValue() ? this.style("font-size").toPixels() + "px" : "", this.style("font-family").value).toString();
                    }
                    if (this.attribute("transform").hasValue()) {
                        let transform = new svg.Transform(this.attribute("transform").value);
                        transform.apply(ctx);
                    }
                    if (this.style("clip-path").hasValue()) {
                        let clip = this.style("clip-path").getDefinition();
                        if (clip != null) clip.apply(ctx);
                    }
                    if (this.style("opacity").hasValue()) {
                        ctx.globalAlpha = this.style("opacity").numValue();
                    }
                };
            };
            svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase();
            svg.Element.PathElementBase = function(node) {
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                this.path = function(ctx) {
                    if (ctx != null) ctx.beginPath();
                    return new svg.BoundingBox();
                };
                this.renderChildren = function(ctx) {
                    this.path(ctx);
                    svg.Mouse.checkPath(this, ctx);
                    if (ctx.fillStyle != "") {
                        if (this.attribute("fill-rule").hasValue()) {
                            ctx.fill(this.attribute("fill-rule").value);
                        } else {
                            ctx.fill();
                        }
                    }
                    if (ctx.strokeStyle != "") ctx.stroke();
                    let markers = this.getMarkers();
                    if (markers != null) {
                        if (this.style("marker-start").isUrlDefinition()) {
                            let marker = this.style("marker-start").getDefinition();
                            marker.render(ctx, markers[0][0], markers[0][1]);
                        }
                        if (this.style("marker-mid").isUrlDefinition()) {
                            let marker = this.style("marker-mid").getDefinition();
                            for (let i = 1; i < markers.length - 1; i++) {
                                marker.render(ctx, markers[i][0], markers[i][1]);
                            }
                        }
                        if (this.style("marker-end").isUrlDefinition()) {
                            let marker = this.style("marker-end").getDefinition();
                            marker.render(ctx, markers[markers.length - 1][0], markers[markers.length - 1][1]);
                        }
                    }
                };
                this.getBoundingBox = function() {
                    return this.path();
                };
                this.getMarkers = function() {
                    return null;
                };
            };
            svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase();
            svg.Element.svg = function(node) {
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                this.baseClearContext = this.clearContext;
                this.clearContext = function(ctx) {
                    this.baseClearContext(ctx);
                    svg.ViewPort.RemoveCurrent();
                };
                this.baseSetContext = this.setContext;
                this.setContext = function(ctx) {
                    ctx.strokeStyle = "rgba(0,0,0,0)";
                    ctx.lineCap = "butt";
                    ctx.lineJoin = "miter";
                    ctx.miterLimit = 4;
                    this.baseSetContext(ctx);
                    if (!this.attribute("x").hasValue()) this.attribute("x", true).value = 0;
                    if (!this.attribute("y").hasValue()) this.attribute("y", true).value = 0;
                    ctx.translate(this.attribute("x").toPixels("x"), this.attribute("y").toPixels("y"));
                    let width = svg.ViewPort.width();
                    let height = svg.ViewPort.height();
                    if (!this.attribute("width").hasValue()) this.attribute("width", true).value = "100%";
                    if (!this.attribute("height").hasValue()) this.attribute("height", true).value = "100%";
                    if (typeof this.root == "undefined") {
                        width = this.attribute("width").toPixels("x");
                        height = this.attribute("height").toPixels("y");
                        let x = 0;
                        let y = 0;
                        if (this.attribute("refX").hasValue() && this.attribute("refY").hasValue()) {
                            x = -this.attribute("refX").toPixels("x");
                            y = -this.attribute("refY").toPixels("y");
                        }
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(width, y);
                        ctx.lineTo(width, height);
                        ctx.lineTo(x, height);
                        ctx.closePath();
                        ctx.clip();
                    }
                    svg.ViewPort.SetCurrent(width, height);
                    if (this.attribute("viewBox").hasValue()) {
                        let viewBox = svg.ToNumberArray(this.attribute("viewBox").value);
                        let minX = viewBox[0];
                        let minY = viewBox[1];
                        width = viewBox[2];
                        height = viewBox[3];
                        svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, svg.ViewPort.width(), width, svg.ViewPort.height(), height, minX, minY, this.attribute("refX").value, this.attribute("refY").value);
                        svg.ViewPort.RemoveCurrent();
                        svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
                    }
                };
            };
            svg.Element.svg.prototype = new svg.Element.RenderedElementBase();
            svg.Element.rect = function(node) {
                this.base = svg.Element.PathElementBase;
                this.base(node);
                this.path = function(ctx) {
                    let x = this.attribute("x").toPixels("x");
                    let y = this.attribute("y").toPixels("y");
                    let width = this.attribute("width").toPixels("x");
                    let height = this.attribute("height").toPixels("y");
                    let rx = this.attribute("rx").toPixels("x");
                    let ry = this.attribute("ry").toPixels("y");
                    if (this.attribute("rx").hasValue() && !this.attribute("ry").hasValue()) ry = rx;
                    if (this.attribute("ry").hasValue() && !this.attribute("rx").hasValue()) rx = ry;
                    rx = Math.min(rx, width / 2);
                    ry = Math.min(ry, height / 2);
                    if (ctx != null) {
                        ctx.beginPath();
                        ctx.moveTo(x + rx, y);
                        ctx.lineTo(x + width - rx, y);
                        ctx.quadraticCurveTo(x + width, y, x + width, y + ry);
                        ctx.lineTo(x + width, y + height - ry);
                        ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height);
                        ctx.lineTo(x + rx, y + height);
                        ctx.quadraticCurveTo(x, y + height, x, y + height - ry);
                        ctx.lineTo(x, y + ry);
                        ctx.quadraticCurveTo(x, y, x + rx, y);
                        ctx.closePath();
                    }
                    return new svg.BoundingBox(x, y, x + width, y + height);
                };
            };
            svg.Element.rect.prototype = new svg.Element.PathElementBase();
            svg.Element.circle = function(node) {
                this.base = svg.Element.PathElementBase;
                this.base(node);
                this.path = function(ctx) {
                    let cx = this.attribute("cx").toPixels("x");
                    let cy = this.attribute("cy").toPixels("y");
                    let r = this.attribute("r").toPixels();
                    if (ctx != null) {
                        ctx.beginPath();
                        ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
                        ctx.closePath();
                    }
                    return new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r);
                };
            };
            svg.Element.circle.prototype = new svg.Element.PathElementBase();
            svg.Element.ellipse = function(node) {
                this.base = svg.Element.PathElementBase;
                this.base(node);
                this.path = function(ctx) {
                    let KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
                    let rx = this.attribute("rx").toPixels("x");
                    let ry = this.attribute("ry").toPixels("y");
                    let cx = this.attribute("cx").toPixels("x");
                    let cy = this.attribute("cy").toPixels("y");
                    if (ctx != null) {
                        ctx.beginPath();
                        ctx.moveTo(cx, cy - ry);
                        ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
                        ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);
                        ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);
                        ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);
                        ctx.closePath();
                    }
                    return new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
                };
            };
            svg.Element.ellipse.prototype = new svg.Element.PathElementBase();
            svg.Element.line = function(node) {
                this.base = svg.Element.PathElementBase;
                this.base(node);
                this.getPoints = function() {
                    return [ new svg.Point(this.attribute("x1").toPixels("x"), this.attribute("y1").toPixels("y")), new svg.Point(this.attribute("x2").toPixels("x"), this.attribute("y2").toPixels("y")) ];
                };
                this.path = function(ctx) {
                    let points = this.getPoints();
                    if (ctx != null) {
                        ctx.beginPath();
                        ctx.moveTo(points[0].x, points[0].y);
                        ctx.lineTo(points[1].x, points[1].y);
                    }
                    return new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y);
                };
                this.getMarkers = function() {
                    let points = this.getPoints();
                    let a = points[0].angleTo(points[1]);
                    return [ [ points[0], a ], [ points[1], a ] ];
                };
            };
            svg.Element.line.prototype = new svg.Element.PathElementBase();
            svg.Element.polyline = function(node) {
                this.base = svg.Element.PathElementBase;
                this.base(node);
                this.points = svg.CreatePath(this.attribute("points").value);
                this.path = function(ctx) {
                    let bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
                    if (ctx != null) {
                        ctx.beginPath();
                        ctx.moveTo(this.points[0].x, this.points[0].y);
                    }
                    for (let i = 1; i < this.points.length; i++) {
                        bb.addPoint(this.points[i].x, this.points[i].y);
                        if (ctx != null) ctx.lineTo(this.points[i].x, this.points[i].y);
                    }
                    return bb;
                };
                this.getMarkers = function() {
                    let markers = [];
                    for (let i = 0; i < this.points.length - 1; i++) {
                        markers.push([ this.points[i], this.points[i].angleTo(this.points[i + 1]) ]);
                    }
                    markers.push([ this.points[this.points.length - 1], markers[markers.length - 1][1] ]);
                    return markers;
                };
            };
            svg.Element.polyline.prototype = new svg.Element.PathElementBase();
            svg.Element.polygon = function(node) {
                this.base = svg.Element.polyline;
                this.base(node);
                this.basePath = this.path;
                this.path = function(ctx) {
                    let bb = this.basePath(ctx);
                    if (ctx != null) {
                        ctx.lineTo(this.points[0].x, this.points[0].y);
                        ctx.closePath();
                    }
                    return bb;
                };
            };
            svg.Element.polygon.prototype = new svg.Element.polyline();
            svg.Element.path = function(node) {
                this.base = svg.Element.PathElementBase;
                this.base(node);
                let d = this.attribute("d").value;
                d = d.replace(/,/gm, " ");
                d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2");
                d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2");
                d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, "$1 $2");
                d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2");
                d = d.replace(/([0-9])([+\-])/gm, "$1 $2");
                d = d.replace(/(\.[0-9]*)(\.)/gm, "$1 $2");
                d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, "$1 $3 $4 ");
                d = svg.compressSpaces(d);
                d = svg.trim(d);
                this.PathParser = new function(d) {
                    this.tokens = d.split(" ");
                    this.reset = function() {
                        this.i = -1;
                        this.command = "";
                        this.previousCommand = "";
                        this.start = new svg.Point(0, 0);
                        this.control = new svg.Point(0, 0);
                        this.current = new svg.Point(0, 0);
                        this.points = [];
                        this.angles = [];
                    };
                    this.isEnd = function() {
                        return this.i >= this.tokens.length - 1;
                    };
                    this.isCommandOrEnd = function() {
                        if (this.isEnd()) return true;
                        return this.tokens[this.i + 1].match(/^[A-Za-z]$/) != null;
                    };
                    this.isRelativeCommand = function() {
                        switch (this.command) {
                          case "m":
                          case "l":
                          case "h":
                          case "v":
                          case "c":
                          case "s":
                          case "q":
                          case "t":
                          case "a":
                          case "z":
                            return true;
                            break;
                        }
                        return false;
                    };
                    this.getToken = function() {
                        this.i++;
                        return this.tokens[this.i];
                    };
                    this.getScalar = function() {
                        return parseFloat(this.getToken());
                    };
                    this.nextCommand = function() {
                        this.previousCommand = this.command;
                        this.command = this.getToken();
                    };
                    this.getPoint = function() {
                        let p = new svg.Point(this.getScalar(), this.getScalar());
                        return this.makeAbsolute(p);
                    };
                    this.getAsControlPoint = function() {
                        let p = this.getPoint();
                        this.control = p;
                        return p;
                    };
                    this.getAsCurrentPoint = function() {
                        let p = this.getPoint();
                        this.current = p;
                        return p;
                    };
                    this.getReflectedControlPoint = function() {
                        if (this.previousCommand.toLowerCase() != "c" && this.previousCommand.toLowerCase() != "s" && this.previousCommand.toLowerCase() != "q" && this.previousCommand.toLowerCase() != "t") {
                            return this.current;
                        }
                        let p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
                        return p;
                    };
                    this.makeAbsolute = function(p) {
                        if (this.isRelativeCommand()) {
                            p.x += this.current.x;
                            p.y += this.current.y;
                        }
                        return p;
                    };
                    this.addMarker = function(p, from, priorTo) {
                        if (priorTo != null && this.angles.length > 0 && this.angles[this.angles.length - 1] == null) {
                            this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo);
                        }
                        this.addMarkerAngle(p, from == null ? null : from.angleTo(p));
                    };
                    this.addMarkerAngle = function(p, a) {
                        this.points.push(p);
                        this.angles.push(a);
                    };
                    this.getMarkerPoints = function() {
                        return this.points;
                    };
                    this.getMarkerAngles = function() {
                        for (let i = 0; i < this.angles.length; i++) {
                            if (this.angles[i] == null) {
                                for (let j = i + 1; j < this.angles.length; j++) {
                                    if (this.angles[j] != null) {
                                        this.angles[i] = this.angles[j];
                                        break;
                                    }
                                }
                            }
                        }
                        return this.angles;
                    };
                }(d);
                this.path = function(ctx) {
                    let pp = this.PathParser;
                    pp.reset();
                    let bb = new svg.BoundingBox();
                    if (ctx != null) ctx.beginPath();
                    while (!pp.isEnd()) {
                        pp.nextCommand();
                        switch (pp.command) {
                          case "M":
                          case "m":
                            let p = pp.getAsCurrentPoint();
                            pp.addMarker(p);
                            bb.addPoint(p.x, p.y);
                            if (ctx != null) ctx.moveTo(p.x, p.y);
                            pp.start = pp.current;
                            while (!pp.isCommandOrEnd()) {
                                let p = pp.getAsCurrentPoint();
                                pp.addMarker(p, pp.start);
                                bb.addPoint(p.x, p.y);
                                if (ctx != null) ctx.lineTo(p.x, p.y);
                            }
                            break;

                          case "L":
                          case "l":
                            while (!pp.isCommandOrEnd()) {
                                let c = pp.current;
                                let p = pp.getAsCurrentPoint();
                                pp.addMarker(p, c);
                                bb.addPoint(p.x, p.y);
                                if (ctx != null) ctx.lineTo(p.x, p.y);
                            }
                            break;

                          case "H":
                          case "h":
                            while (!pp.isCommandOrEnd()) {
                                let newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
                                pp.addMarker(newP, pp.current);
                                pp.current = newP;
                                bb.addPoint(pp.current.x, pp.current.y);
                                if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
                            }
                            break;

                          case "V":
                          case "v":
                            while (!pp.isCommandOrEnd()) {
                                let newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
                                pp.addMarker(newP, pp.current);
                                pp.current = newP;
                                bb.addPoint(pp.current.x, pp.current.y);
                                if (ctx != null) ctx.lineTo(pp.current.x, pp.current.y);
                            }
                            break;

                          case "C":
                          case "c":
                            while (!pp.isCommandOrEnd()) {
                                let curr = pp.current;
                                let p1 = pp.getPoint();
                                let cntrl = pp.getAsControlPoint();
                                let cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, p1);
                                bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;

                          case "S":
                          case "s":
                            while (!pp.isCommandOrEnd()) {
                                let curr = pp.current;
                                let p1 = pp.getReflectedControlPoint();
                                let cntrl = pp.getAsControlPoint();
                                let cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, p1);
                                bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;

                          case "Q":
                          case "q":
                            while (!pp.isCommandOrEnd()) {
                                let curr = pp.current;
                                let cntrl = pp.getAsControlPoint();
                                let cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, cntrl);
                                bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;

                          case "T":
                          case "t":
                            while (!pp.isCommandOrEnd()) {
                                let curr = pp.current;
                                let cntrl = pp.getReflectedControlPoint();
                                pp.control = cntrl;
                                let cp = pp.getAsCurrentPoint();
                                pp.addMarker(cp, cntrl, cntrl);
                                bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y);
                                if (ctx != null) ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y);
                            }
                            break;

                          case "A":
                          case "a":
                            while (!pp.isCommandOrEnd()) {
                                let curr = pp.current;
                                let rx = pp.getScalar();
                                let ry = pp.getScalar();
                                let xAxisRotation = pp.getScalar() * (Math.PI / 180);
                                let largeArcFlag = pp.getScalar();
                                let sweepFlag = pp.getScalar();
                                let cp = pp.getAsCurrentPoint();
                                let currp = new svg.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2);
                                let l = Math.pow(currp.x, 2) / Math.pow(rx, 2) + Math.pow(currp.y, 2) / Math.pow(ry, 2);
                                if (l > 1) {
                                    rx *= Math.sqrt(l);
                                    ry *= Math.sqrt(l);
                                }
                                let s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt((Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(currp.y, 2) - Math.pow(ry, 2) * Math.pow(currp.x, 2)) / (Math.pow(rx, 2) * Math.pow(currp.y, 2) + Math.pow(ry, 2) * Math.pow(currp.x, 2)));
                                if (isNaN(s)) s = 0;
                                let cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx);
                                let centp = new svg.Point((curr.x + cp.x) / 2 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
                                let m = function(v) {
                                    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
                                };
                                let r = function(u, v) {
                                    return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v));
                                };
                                let a = function(u, v) {
                                    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v));
                                };
                                let a1 = a([ 1, 0 ], [ (currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry ]);
                                let u = [ (currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry ];
                                let v = [ (-currp.x - cpp.x) / rx, (-currp.y - cpp.y) / ry ];
                                let ad = a(u, v);
                                if (r(u, v) <= -1) ad = Math.PI;
                                if (r(u, v) >= 1) ad = 0;
                                let dir = 1 - sweepFlag ? 1 : -1;
                                let ah = a1 + dir * (ad / 2);
                                let halfWay = new svg.Point(centp.x + rx * Math.cos(ah), centp.y + ry * Math.sin(ah));
                                pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
                                pp.addMarkerAngle(cp, ah - dir * Math.PI);
                                bb.addPoint(cp.x, cp.y);
                                if (ctx != null) {
                                    let r = rx > ry ? rx : ry;
                                    let sx = rx > ry ? 1 : rx / ry;
                                    let sy = rx > ry ? ry / rx : 1;
                                    ctx.translate(centp.x, centp.y);
                                    ctx.rotate(xAxisRotation);
                                    ctx.scale(sx, sy);
                                    ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag);
                                    ctx.scale(1 / sx, 1 / sy);
                                    ctx.rotate(-xAxisRotation);
                                    ctx.translate(-centp.x, -centp.y);
                                }
                            }
                            break;

                          case "Z":
                          case "z":
                            if (ctx != null) ctx.closePath();
                            pp.current = pp.start;
                        }
                    }
                    return bb;
                };
                this.getMarkers = function() {
                    let points = this.PathParser.getMarkerPoints();
                    let angles = this.PathParser.getMarkerAngles();
                    let markers = [];
                    for (let i = 0; i < points.length; i++) {
                        markers.push([ points[i], angles[i] ]);
                    }
                    return markers;
                };
            };
            svg.Element.path.prototype = new svg.Element.PathElementBase();
            svg.Element.pattern = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.createPattern = function(ctx, element) {
                    let width = this.attribute("width").toPixels("x", true);
                    let height = this.attribute("height").toPixels("y", true);
                    let tempSvg = new svg.Element.svg();
                    tempSvg.attributes["viewBox"] = new svg.Property("viewBox", this.attribute("viewBox").value);
                    tempSvg.attributes["width"] = new svg.Property("width", width + "px");
                    tempSvg.attributes["height"] = new svg.Property("height", height + "px");
                    tempSvg.attributes["transform"] = new svg.Property("transform", this.attribute("patternTransform").value);
                    tempSvg.children = this.children;
                    let c = document.createElement("canvas");
                    c.width = width;
                    c.height = height;
                    let cctx = c.getContext("2d");
                    if (this.attribute("x").hasValue() && this.attribute("y").hasValue()) {
                        cctx.translate(this.attribute("x").toPixels("x", true), this.attribute("y").toPixels("y", true));
                    }
                    for (let x = -1; x <= 1; x++) {
                        for (let y = -1; y <= 1; y++) {
                            cctx.save();
                            cctx.translate(x * c.width, y * c.height);
                            tempSvg.render(cctx);
                            cctx.restore();
                        }
                    }
                    let pattern = ctx.createPattern(c, "repeat");
                    return pattern;
                };
            };
            svg.Element.pattern.prototype = new svg.Element.ElementBase();
            svg.Element.marker = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.baseRender = this.render;
                this.render = function(ctx, point, angle) {
                    ctx.translate(point.x, point.y);
                    if (this.attribute("orient").valueOrDefault("auto") == "auto") ctx.rotate(angle);
                    if (this.attribute("markerUnits").valueOrDefault("strokeWidth") == "strokeWidth") ctx.scale(ctx.lineWidth, ctx.lineWidth);
                    ctx.save();
                    let tempSvg = new svg.Element.svg();
                    tempSvg.attributes["viewBox"] = new svg.Property("viewBox", this.attribute("viewBox").value);
                    tempSvg.attributes["refX"] = new svg.Property("refX", this.attribute("refX").value);
                    tempSvg.attributes["refY"] = new svg.Property("refY", this.attribute("refY").value);
                    tempSvg.attributes["width"] = new svg.Property("width", this.attribute("markerWidth").value);
                    tempSvg.attributes["height"] = new svg.Property("height", this.attribute("markerHeight").value);
                    tempSvg.attributes["fill"] = new svg.Property("fill", this.attribute("fill").valueOrDefault("black"));
                    tempSvg.attributes["stroke"] = new svg.Property("stroke", this.attribute("stroke").valueOrDefault("none"));
                    tempSvg.children = this.children;
                    tempSvg.render(ctx);
                    ctx.restore();
                    if (this.attribute("markerUnits").valueOrDefault("strokeWidth") == "strokeWidth") ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);
                    if (this.attribute("orient").valueOrDefault("auto") == "auto") ctx.rotate(-angle);
                    ctx.translate(-point.x, -point.y);
                };
            };
            svg.Element.marker.prototype = new svg.Element.ElementBase();
            svg.Element.defs = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.render = function(ctx) {};
            };
            svg.Element.defs.prototype = new svg.Element.ElementBase();
            svg.Element.GradientBase = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.gradientUnits = this.attribute("gradientUnits").valueOrDefault("objectBoundingBox");
                this.stops = [];
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i];
                    if (child.type == "stop") this.stops.push(child);
                }
                this.getGradient = function() {};
                this.createGradient = function(ctx, element, parentOpacityProp) {
                    let stopsContainer = this;
                    if (this.getHrefAttribute().hasValue()) {
                        stopsContainer = this.getHrefAttribute().getDefinition();
                    }
                    let addParentOpacity = function(color) {
                        if (parentOpacityProp.hasValue()) {
                            let p = new svg.Property("color", color);
                            return p.addOpacity(parentOpacityProp.value).value;
                        }
                        return color;
                    };
                    let g = this.getGradient(ctx, element);
                    if (g == null) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
                    for (let i = 0; i < stopsContainer.stops.length; i++) {
                        g.addColorStop(stopsContainer.stops[i].offset, addParentOpacity(stopsContainer.stops[i].color));
                    }
                    if (this.attribute("gradientTransform").hasValue()) {
                        let rootView = svg.ViewPort.viewPorts[0];
                        let rect = new svg.Element.rect();
                        rect.attributes["x"] = new svg.Property("x", -svg.MAX_VIRTUAL_PIXELS / 3);
                        rect.attributes["y"] = new svg.Property("y", -svg.MAX_VIRTUAL_PIXELS / 3);
                        rect.attributes["width"] = new svg.Property("width", svg.MAX_VIRTUAL_PIXELS);
                        rect.attributes["height"] = new svg.Property("height", svg.MAX_VIRTUAL_PIXELS);
                        let group = new svg.Element.g();
                        group.attributes["transform"] = new svg.Property("transform", this.attribute("gradientTransform").value);
                        group.children = [ rect ];
                        let tempSvg = new svg.Element.svg();
                        tempSvg.attributes["x"] = new svg.Property("x", 0);
                        tempSvg.attributes["y"] = new svg.Property("y", 0);
                        tempSvg.attributes["width"] = new svg.Property("width", rootView.width);
                        tempSvg.attributes["height"] = new svg.Property("height", rootView.height);
                        tempSvg.children = [ group ];
                        let c = document.createElement("canvas");
                        c.width = rootView.width;
                        c.height = rootView.height;
                        let tempCtx = c.getContext("2d");
                        tempCtx.fillStyle = g;
                        tempSvg.render(tempCtx);
                        return tempCtx.createPattern(c, "no-repeat");
                    }
                    return g;
                };
            };
            svg.Element.GradientBase.prototype = new svg.Element.ElementBase();
            svg.Element.linearGradient = function(node) {
                this.base = svg.Element.GradientBase;
                this.base(node);
                this.getGradient = function(ctx, element) {
                    let bb = element.getBoundingBox();
                    if (!this.attribute("x1").hasValue() && !this.attribute("y1").hasValue() && !this.attribute("x2").hasValue() && !this.attribute("y2").hasValue()) {
                        this.attribute("x1", true).value = 0;
                        this.attribute("y1", true).value = 0;
                        this.attribute("x2", true).value = 1;
                        this.attribute("y2", true).value = 0;
                    }
                    let x1 = this.gradientUnits == "objectBoundingBox" ? bb.x() + bb.width() * this.attribute("x1").numValue() : this.attribute("x1").toPixels("x");
                    let y1 = this.gradientUnits == "objectBoundingBox" ? bb.y() + bb.height() * this.attribute("y1").numValue() : this.attribute("y1").toPixels("y");
                    let x2 = this.gradientUnits == "objectBoundingBox" ? bb.x() + bb.width() * this.attribute("x2").numValue() : this.attribute("x2").toPixels("x");
                    let y2 = this.gradientUnits == "objectBoundingBox" ? bb.y() + bb.height() * this.attribute("y2").numValue() : this.attribute("y2").toPixels("y");
                    if (x1 == x2 && y1 == y2) return null;
                    return ctx.createLinearGradient(x1, y1, x2, y2);
                };
            };
            svg.Element.linearGradient.prototype = new svg.Element.GradientBase();
            svg.Element.radialGradient = function(node) {
                this.base = svg.Element.GradientBase;
                this.base(node);
                this.getGradient = function(ctx, element) {
                    let bb = element.getBoundingBox();
                    if (!this.attribute("cx").hasValue()) this.attribute("cx", true).value = "50%";
                    if (!this.attribute("cy").hasValue()) this.attribute("cy", true).value = "50%";
                    if (!this.attribute("r").hasValue()) this.attribute("r", true).value = "50%";
                    let cx = this.gradientUnits == "objectBoundingBox" ? bb.x() + bb.width() * this.attribute("cx").numValue() : this.attribute("cx").toPixels("x");
                    let cy = this.gradientUnits == "objectBoundingBox" ? bb.y() + bb.height() * this.attribute("cy").numValue() : this.attribute("cy").toPixels("y");
                    let fx = cx;
                    let fy = cy;
                    if (this.attribute("fx").hasValue()) {
                        fx = this.gradientUnits == "objectBoundingBox" ? bb.x() + bb.width() * this.attribute("fx").numValue() : this.attribute("fx").toPixels("x");
                    }
                    if (this.attribute("fy").hasValue()) {
                        fy = this.gradientUnits == "objectBoundingBox" ? bb.y() + bb.height() * this.attribute("fy").numValue() : this.attribute("fy").toPixels("y");
                    }
                    let r = this.gradientUnits == "objectBoundingBox" ? (bb.width() + bb.height()) / 2 * this.attribute("r").numValue() : this.attribute("r").toPixels();
                    return ctx.createRadialGradient(fx, fy, 0, cx, cy, r);
                };
            };
            svg.Element.radialGradient.prototype = new svg.Element.GradientBase();
            svg.Element.stop = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.offset = this.attribute("offset").numValue();
                if (this.offset < 0) this.offset = 0;
                if (this.offset > 1) this.offset = 1;
                let stopColor = this.style("stop-color");
                if (this.style("stop-opacity").hasValue()) stopColor = stopColor.addOpacity(this.style("stop-opacity").value);
                this.color = stopColor.value;
            };
            svg.Element.stop.prototype = new svg.Element.ElementBase();
            svg.Element.AnimateBase = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                svg.Animations.push(this);
                this.duration = 0;
                this.begin = this.attribute("begin").toMilliseconds();
                this.maxDuration = this.begin + this.attribute("dur").toMilliseconds();
                this.getProperty = function() {
                    let attributeType = this.attribute("attributeType").value;
                    let attributeName = this.attribute("attributeName").value;
                    if (attributeType == "CSS") {
                        return this.parent.style(attributeName, true);
                    }
                    return this.parent.attribute(attributeName, true);
                };
                this.initialValue = null;
                this.initialUnits = "";
                this.removed = false;
                this.calcValue = function() {
                    return "";
                };
                this.update = function(delta) {
                    if (this.initialValue == null) {
                        this.initialValue = this.getProperty().value;
                        this.initialUnits = this.getProperty().getUnits();
                    }
                    if (this.duration > this.maxDuration) {
                        if (this.attribute("repeatCount").value == "indefinite" || this.attribute("repeatDur").value == "indefinite") {
                            this.duration = 0;
                        } else if (this.attribute("fill").valueOrDefault("remove") == "remove" && !this.removed) {
                            this.removed = true;
                            this.getProperty().value = this.initialValue;
                            return true;
                        } else {
                            return false;
                        }
                    }
                    this.duration = this.duration + delta;
                    let updated = false;
                    if (this.begin < this.duration) {
                        let newValue = this.calcValue();
                        if (this.attribute("type").hasValue()) {
                            let type = this.attribute("type").value;
                            newValue = type + "(" + newValue + ")";
                        }
                        this.getProperty().value = newValue;
                        updated = true;
                    }
                    return updated;
                };
                this.from = this.attribute("from");
                this.to = this.attribute("to");
                this.values = this.attribute("values");
                if (this.values.hasValue()) this.values.value = this.values.value.split(";");
                this.progress = function() {
                    let ret = {
                        progress: (this.duration - this.begin) / (this.maxDuration - this.begin)
                    };
                    if (this.values.hasValue()) {
                        let p = ret.progress * (this.values.value.length - 1);
                        let lb = Math.floor(p), ub = Math.ceil(p);
                        ret.from = new svg.Property("from", parseFloat(this.values.value[lb]));
                        ret.to = new svg.Property("to", parseFloat(this.values.value[ub]));
                        ret.progress = (p - lb) / (ub - lb);
                    } else {
                        ret.from = this.from;
                        ret.to = this.to;
                    }
                    return ret;
                };
            };
            svg.Element.AnimateBase.prototype = new svg.Element.ElementBase();
            svg.Element.animate = function(node) {
                this.base = svg.Element.AnimateBase;
                this.base(node);
                this.calcValue = function() {
                    let p = this.progress();
                    let newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
                    return newValue + this.initialUnits;
                };
            };
            svg.Element.animate.prototype = new svg.Element.AnimateBase();
            svg.Element.animateColor = function(node) {
                this.base = svg.Element.AnimateBase;
                this.base(node);
                this.calcValue = function() {
                    let p = this.progress();
                    let from = new RGBColor(p.from.value);
                    let to = new RGBColor(p.to.value);
                    if (from.ok && to.ok) {
                        let r = from.r + (to.r - from.r) * p.progress;
                        let g = from.g + (to.g - from.g) * p.progress;
                        let b = from.b + (to.b - from.b) * p.progress;
                        return "rgb(" + parseInt(r, 10) + "," + parseInt(g, 10) + "," + parseInt(b, 10) + ")";
                    }
                    return this.attribute("from").value;
                };
            };
            svg.Element.animateColor.prototype = new svg.Element.AnimateBase();
            svg.Element.animateTransform = function(node) {
                this.base = svg.Element.AnimateBase;
                this.base(node);
                this.calcValue = function() {
                    let p = this.progress();
                    let from = svg.ToNumberArray(p.from.value);
                    let to = svg.ToNumberArray(p.to.value);
                    let newValue = "";
                    for (let i = 0; i < from.length; i++) {
                        newValue += from[i] + (to[i] - from[i]) * p.progress + " ";
                    }
                    return newValue;
                };
            };
            svg.Element.animateTransform.prototype = new svg.Element.animate();
            svg.Element.font = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.horizAdvX = this.attribute("horiz-adv-x").numValue();
                this.isRTL = false;
                this.isArabic = false;
                this.fontFace = null;
                this.missingGlyph = null;
                this.glyphs = [];
                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i];
                    if (child.type == "font-face") {
                        this.fontFace = child;
                        if (child.style("font-family").hasValue()) {
                            svg.Definitions[child.style("font-family").value] = this;
                        }
                    } else if (child.type == "missing-glyph") this.missingGlyph = child; else if (child.type == "glyph") {
                        if (child.arabicForm != "") {
                            this.isRTL = true;
                            this.isArabic = true;
                            if (typeof this.glyphs[child.unicode] == "undefined") this.glyphs[child.unicode] = [];
                            this.glyphs[child.unicode][child.arabicForm] = child;
                        } else {
                            this.glyphs[child.unicode] = child;
                        }
                    }
                }
            };
            svg.Element.font.prototype = new svg.Element.ElementBase();
            svg.Element.fontface = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.ascent = this.attribute("ascent").value;
                this.descent = this.attribute("descent").value;
                this.unitsPerEm = this.attribute("units-per-em").numValue();
            };
            svg.Element.fontface.prototype = new svg.Element.ElementBase();
            svg.Element.missingglyph = function(node) {
                this.base = svg.Element.path;
                this.base(node);
                this.horizAdvX = 0;
            };
            svg.Element.missingglyph.prototype = new svg.Element.path();
            svg.Element.glyph = function(node) {
                this.base = svg.Element.path;
                this.base(node);
                this.horizAdvX = this.attribute("horiz-adv-x").numValue();
                this.unicode = this.attribute("unicode").value;
                this.arabicForm = this.attribute("arabic-form").value;
            };
            svg.Element.glyph.prototype = new svg.Element.path();
            svg.Element.text = function(node) {
                this.captureTextNodes = true;
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                this.baseSetContext = this.setContext;
                this.setContext = function(ctx) {
                    this.baseSetContext(ctx);
                    if (this.style("dominant-baseline").hasValue()) ctx.textBaseline = this.style("dominant-baseline").value;
                    if (this.style("alignment-baseline").hasValue()) ctx.textBaseline = this.style("alignment-baseline").value;
                };
                this.getBoundingBox = function() {
                    return new svg.BoundingBox(this.attribute("x").toPixels("x"), this.attribute("y").toPixels("y"), 0, 0);
                };
                this.renderChildren = function(ctx) {
                    this.x = this.attribute("x").toPixels("x");
                    this.y = this.attribute("y").toPixels("y");
                    this.x += this.getAnchorDelta(ctx, this, 0);
                    for (let i = 0; i < this.children.length; i++) {
                        this.renderChild(ctx, this, i);
                    }
                };
                this.getAnchorDelta = function(ctx, parent, startI) {
                    let textAnchor = this.style("text-anchor").valueOrDefault("start");
                    if (textAnchor != "start") {
                        let width = 0;
                        for (let i = startI; i < parent.children.length; i++) {
                            let child = parent.children[i];
                            if (i > startI && child.attribute("x").hasValue()) break;
                            width += child.measureTextRecursive(ctx);
                        }
                        return -1 * (textAnchor == "end" ? width : width / 2);
                    }
                    return 0;
                };
                this.renderChild = function(ctx, parent, i) {
                    let child = parent.children[i];
                    if (child.attribute("x").hasValue()) {
                        child.x = child.attribute("x").toPixels("x") + this.getAnchorDelta(ctx, parent, i);
                    } else {
                        if (this.attribute("dx").hasValue()) this.x += this.attribute("dx").toPixels("x");
                        if (child.attribute("dx").hasValue()) this.x += child.attribute("dx").toPixels("x");
                        child.x = this.x;
                    }
                    this.x = child.x + child.measureText(ctx);
                    if (child.attribute("y").hasValue()) {
                        child.y = child.attribute("y").toPixels("y");
                    } else {
                        if (this.attribute("dy").hasValue()) this.y += this.attribute("dy").toPixels("y");
                        if (child.attribute("dy").hasValue()) this.y += child.attribute("dy").toPixels("y");
                        child.y = this.y;
                    }
                    this.y = child.y;
                    child.render(ctx);
                    for (let i = 0; i < child.children.length; i++) {
                        this.renderChild(ctx, child, i);
                    }
                };
            };
            svg.Element.text.prototype = new svg.Element.RenderedElementBase();
            svg.Element.TextElementBase = function(node) {
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                this.getGlyph = function(font, text, i) {
                    let c = text[i];
                    let glyph = null;
                    if (font.isArabic) {
                        let arabicForm = "isolated";
                        if ((i == 0 || text[i - 1] == " ") && i < text.length - 2 && text[i + 1] != " ") arabicForm = "terminal";
                        if (i > 0 && text[i - 1] != " " && i < text.length - 2 && text[i + 1] != " ") arabicForm = "medial";
                        if (i > 0 && text[i - 1] != " " && (i == text.length - 1 || text[i + 1] == " ")) arabicForm = "initial";
                        if (typeof font.glyphs[c] != "undefined") {
                            glyph = font.glyphs[c][arabicForm];
                            if (glyph == null && font.glyphs[c].type == "glyph") glyph = font.glyphs[c];
                        }
                    } else {
                        glyph = font.glyphs[c];
                    }
                    if (glyph == null) glyph = font.missingGlyph;
                    return glyph;
                };
                this.renderChildren = function(ctx) {
                    let customFont = this.parent.style("font-family").getDefinition();
                    if (customFont != null) {
                        let fontSize = this.parent.style("font-size").numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
                        let fontStyle = this.parent.style("font-style").valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle);
                        let text = this.getText();
                        if (customFont.isRTL) text = text.split("").reverse().join("");
                        let dx = svg.ToNumberArray(this.parent.attribute("dx").value);
                        for (let i = 0; i < text.length; i++) {
                            let glyph = this.getGlyph(customFont, text, i);
                            let scale = fontSize / customFont.fontFace.unitsPerEm;
                            ctx.translate(this.x, this.y);
                            ctx.scale(scale, -scale);
                            let lw = ctx.lineWidth;
                            ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize;
                            if (fontStyle == "italic") ctx.transform(1, 0, .4, 1, 0, 0);
                            glyph.render(ctx);
                            if (fontStyle == "italic") ctx.transform(1, 0, -.4, 1, 0, 0);
                            ctx.lineWidth = lw;
                            ctx.scale(1 / scale, -1 / scale);
                            ctx.translate(-this.x, -this.y);
                            this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm;
                            if (typeof dx[i] != "undefined" && !isNaN(dx[i])) {
                                this.x += dx[i];
                            }
                        }
                        return;
                    }
                    if (ctx.fillStyle != "") ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y);
                    if (ctx.strokeStyle != "") ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
                };
                this.getText = function() {};
                this.measureTextRecursive = function(ctx) {
                    let width = this.measureText(ctx);
                    for (let i = 0; i < this.children.length; i++) {
                        width += this.children[i].measureTextRecursive(ctx);
                    }
                    return width;
                };
                this.measureText = function(ctx) {
                    let customFont = this.parent.style("font-family").getDefinition();
                    if (customFont != null) {
                        let fontSize = this.parent.style("font-size").numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize);
                        let measure = 0;
                        let text = this.getText();
                        if (customFont.isRTL) text = text.split("").reverse().join("");
                        let dx = svg.ToNumberArray(this.parent.attribute("dx").value);
                        for (let i = 0; i < text.length; i++) {
                            let glyph = this.getGlyph(customFont, text, i);
                            measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
                            if (typeof dx[i] != "undefined" && !isNaN(dx[i])) {
                                measure += dx[i];
                            }
                        }
                        return measure;
                    }
                    let textToMeasure = svg.compressSpaces(this.getText());
                    if (!ctx.measureText) return textToMeasure.length * 10;
                    ctx.save();
                    this.setContext(ctx);
                    let width = ctx.measureText(textToMeasure).width;
                    ctx.restore();
                    return width;
                };
            };
            svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase();
            svg.Element.tspan = function(node) {
                this.captureTextNodes = true;
                this.base = svg.Element.TextElementBase;
                this.base(node);
                this.text = node.nodeValue || node.text || "";
                this.getText = function() {
                    return this.text;
                };
            };
            svg.Element.tspan.prototype = new svg.Element.TextElementBase();
            svg.Element.tref = function(node) {
                this.base = svg.Element.TextElementBase;
                this.base(node);
                this.getText = function() {
                    let element = this.getHrefAttribute().getDefinition();
                    if (element != null) return element.children[0].getText();
                };
            };
            svg.Element.tref.prototype = new svg.Element.TextElementBase();
            svg.Element.a = function(node) {
                this.base = svg.Element.TextElementBase;
                this.base(node);
                this.hasText = true;
                for (let i = 0; i < node.childNodes.length; i++) {
                    if (node.childNodes[i].nodeType != 3) this.hasText = false;
                }
                this.text = this.hasText ? node.childNodes[0].nodeValue : "";
                this.getText = function() {
                    return this.text;
                };
                this.baseRenderChildren = this.renderChildren;
                this.renderChildren = function(ctx) {
                    if (this.hasText) {
                        this.baseRenderChildren(ctx);
                        let fontSize = new svg.Property("fontSize", svg.Font.Parse(svg.ctx.font).fontSize);
                        svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels("y"), this.x + this.measureText(ctx), this.y));
                    } else {
                        let g = new svg.Element.g();
                        g.children = this.children;
                        g.parent = this;
                        g.render(ctx);
                    }
                };
                this.onclick = function() {
                    window.open(this.getHrefAttribute().value);
                };
                this.onmousemove = function() {
                    svg.ctx.canvas.style.cursor = "pointer";
                };
            };
            svg.Element.a.prototype = new svg.Element.TextElementBase();
            svg.Element.image = function(node) {
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                let href = this.getHrefAttribute().value;
                let isSvg = href.match(/\.svg$/);
                svg.Images.push(this);
                this.loaded = false;
                if (!isSvg) {
                    this.img = document.createElement("img");
                    let self = this;
                    this.img.onload = function() {
                        self.loaded = true;
                    };
                    this.img.onerror = function() {
                        if (typeof console != "undefined") {
                            console.log('ERROR: image "' + href + '" not found');
                            self.loaded = true;
                        }
                    };
                    this.img.src = href;
                } else {
                    this.img = svg.ajax(href);
                    this.loaded = true;
                }
                this.renderChildren = function(ctx) {
                    let x = this.attribute("x").toPixels("x");
                    let y = this.attribute("y").toPixels("y");
                    let width = this.attribute("width").toPixels("x");
                    let height = this.attribute("height").toPixels("y");
                    if (width == 0 || height == 0) return;
                    ctx.save();
                    if (isSvg) {
                        ctx.drawSvg(this.img, x, y, width, height);
                    } else {
                        ctx.translate(x, y);
                        svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, width, this.img.width, height, this.img.height, 0, 0);
                        ctx.drawImage(this.img, 0, 0);
                    }
                    ctx.restore();
                };
                this.getBoundingBox = function() {
                    let x = this.attribute("x").toPixels("x");
                    let y = this.attribute("y").toPixels("y");
                    let width = this.attribute("width").toPixels("x");
                    let height = this.attribute("height").toPixels("y");
                    return new svg.BoundingBox(x, y, x + width, y + height);
                };
            };
            svg.Element.image.prototype = new svg.Element.RenderedElementBase();
            svg.Element.g = function(node) {
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                this.getBoundingBox = function() {
                    let bb = new svg.BoundingBox();
                    for (let i = 0; i < this.children.length; i++) {
                        bb.addBoundingBox(this.children[i].getBoundingBox());
                    }
                    return bb;
                };
            };
            svg.Element.g.prototype = new svg.Element.RenderedElementBase();
            svg.Element.symbol = function(node) {
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                this.baseSetContext = this.setContext;
                this.setContext = function(ctx) {
                    this.baseSetContext(ctx);
                    if (this.attribute("viewBox").hasValue()) {
                        let viewBox = svg.ToNumberArray(this.attribute("viewBox").value);
                        let minX = viewBox[0];
                        let minY = viewBox[1];
                        width = viewBox[2];
                        height = viewBox[3];
                        svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, this.attribute("width").toPixels("x"), width, this.attribute("height").toPixels("y"), height, minX, minY);
                        svg.ViewPort.SetCurrent(viewBox[2], viewBox[3]);
                    }
                };
            };
            svg.Element.symbol.prototype = new svg.Element.RenderedElementBase();
            svg.Element.style = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                let css = "";
                for (let i = 0; i < node.childNodes.length; i++) {
                    css += node.childNodes[i].nodeValue;
                }
                css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, "");
                css = svg.compressSpaces(css);
                let cssDefs = css.split("}");
                for (let i = 0; i < cssDefs.length; i++) {
                    if (svg.trim(cssDefs[i]) != "") {
                        let cssDef = cssDefs[i].split("{");
                        let cssClasses = cssDef[0].split(",");
                        let cssProps = cssDef[1].split(";");
                        for (let j = 0; j < cssClasses.length; j++) {
                            let cssClass = svg.trim(cssClasses[j]);
                            if (cssClass != "") {
                                let props = {};
                                for (let k = 0; k < cssProps.length; k++) {
                                    let prop = cssProps[k].indexOf(":");
                                    let name = cssProps[k].substr(0, prop);
                                    let value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
                                    if (name != null && value != null) {
                                        props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value));
                                    }
                                }
                                svg.Styles[cssClass] = props;
                                if (cssClass == "@font-face") {
                                    let fontFamily = props["font-family"].value.replace(/"/g, "");
                                    let srcs = props["src"].value.split(",");
                                    for (let s = 0; s < srcs.length; s++) {
                                        if (srcs[s].indexOf('format("svg")') > 0) {
                                            let urlStart = srcs[s].indexOf("url");
                                            let urlEnd = srcs[s].indexOf(")", urlStart);
                                            let url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6);
                                            let doc = svg.parseXml(svg.ajax(url));
                                            let fonts = doc.getElementsByTagName("font");
                                            for (let f = 0; f < fonts.length; f++) {
                                                let font = svg.CreateElement(fonts[f]);
                                                svg.Definitions[fontFamily] = font;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };
            svg.Element.style.prototype = new svg.Element.ElementBase();
            svg.Element.use = function(node) {
                this.base = svg.Element.RenderedElementBase;
                this.base(node);
                this.baseSetContext = this.setContext;
                this.setContext = function(ctx) {
                    this.baseSetContext(ctx);
                    if (this.attribute("x").hasValue()) ctx.translate(this.attribute("x").toPixels("x"), 0);
                    if (this.attribute("y").hasValue()) ctx.translate(0, this.attribute("y").toPixels("y"));
                };
                this.getDefinition = function() {
                    let element = this.getHrefAttribute().getDefinition();
                    if (this.attribute("width").hasValue()) element.attribute("width", true).value = this.attribute("width").value;
                    if (this.attribute("height").hasValue()) element.attribute("height", true).value = this.attribute("height").value;
                    return element;
                };
                this.path = function(ctx) {
                    let element = this.getDefinition();
                    if (element != null) element.path(ctx);
                };
                this.getBoundingBox = function() {
                    let element = this.getDefinition();
                    if (element != null) return element.getBoundingBox();
                };
                this.renderChildren = function(ctx) {
                    let element = this.getDefinition();
                    if (element != null) {
                        let oldParent = element.parent;
                        element.parent = null;
                        element.render(ctx);
                        element.parent = oldParent;
                    }
                };
            };
            svg.Element.use.prototype = new svg.Element.RenderedElementBase();
            svg.Element.mask = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.apply = function(ctx, element) {
                    let x = this.attribute("x").toPixels("x");
                    let y = this.attribute("y").toPixels("y");
                    let width = this.attribute("width").toPixels("x");
                    let height = this.attribute("height").toPixels("y");
                    if (width == 0 && height == 0) {
                        let bb = new svg.BoundingBox();
                        for (let i = 0; i < this.children.length; i++) {
                            bb.addBoundingBox(this.children[i].getBoundingBox());
                        }
                        let x = Math.floor(bb.x1);
                        let y = Math.floor(bb.y1);
                        let width = Math.floor(bb.width());
                        let height = Math.floor(bb.height());
                    }
                    let mask = element.attribute("mask").value;
                    element.attribute("mask").value = "";
                    let cMask = document.createElement("canvas");
                    cMask.width = x + width;
                    cMask.height = y + height;
                    let maskCtx = cMask.getContext("2d");
                    this.renderChildren(maskCtx);
                    let c = document.createElement("canvas");
                    c.width = x + width;
                    c.height = y + height;
                    let tempCtx = c.getContext("2d");
                    element.render(tempCtx);
                    tempCtx.globalCompositeOperation = "destination-in";
                    tempCtx.fillStyle = maskCtx.createPattern(cMask, "no-repeat");
                    tempCtx.fillRect(0, 0, x + width, y + height);
                    ctx.fillStyle = tempCtx.createPattern(c, "no-repeat");
                    ctx.fillRect(0, 0, x + width, y + height);
                    element.attribute("mask").value = mask;
                };
                this.render = function(ctx) {};
            };
            svg.Element.mask.prototype = new svg.Element.ElementBase();
            svg.Element.clipPath = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.apply = function(ctx) {
                    for (let i = 0; i < this.children.length; i++) {
                        let child = this.children[i];
                        if (typeof child.path != "undefined") {
                            let transform = null;
                            if (child.attribute("transform").hasValue()) {
                                transform = new svg.Transform(child.attribute("transform").value);
                                transform.apply(ctx);
                            }
                            child.path(ctx);
                            ctx.clip();
                            if (transform) {
                                transform.unapply(ctx);
                            }
                        }
                    }
                };
                this.render = function(ctx) {};
            };
            svg.Element.clipPath.prototype = new svg.Element.ElementBase();
            svg.Element.filter = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.apply = function(ctx, element) {
                    let bb = element.getBoundingBox();
                    let x = Math.floor(bb.x1);
                    let y = Math.floor(bb.y1);
                    let width = Math.floor(bb.width());
                    let height = Math.floor(bb.height());
                    let filter = element.style("filter").value;
                    element.style("filter").value = "";
                    let px = 0, py = 0;
                    for (let i = 0; i < this.children.length; i++) {
                        let efd = this.children[i].extraFilterDistance || 0;
                        px = Math.max(px, efd);
                        py = Math.max(py, efd);
                    }
                    let c = document.createElement("canvas");
                    c.width = width + 2 * px;
                    c.height = height + 2 * py;
                    let tempCtx = c.getContext("2d");
                    tempCtx.translate(-x + px, -y + py);
                    element.render(tempCtx);
                    for (let i = 0; i < this.children.length; i++) {
                        this.children[i].apply(tempCtx, 0, 0, width + 2 * px, height + 2 * py);
                    }
                    ctx.drawImage(c, 0, 0, width + 2 * px, height + 2 * py, x - px, y - py, width + 2 * px, height + 2 * py);
                    element.style("filter", true).value = filter;
                };
                this.render = function(ctx) {};
            };
            svg.Element.filter.prototype = new svg.Element.ElementBase();
            svg.Element.feMorphology = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.apply = function(ctx, x, y, width, height) {};
            };
            svg.Element.feMorphology.prototype = new svg.Element.ElementBase();
            svg.Element.feColorMatrix = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                function imGet(img, x, y, width, height, rgba) {
                    return img[y * width * 4 + x * 4 + rgba];
                }
                function imSet(img, x, y, width, height, rgba, val) {
                    img[y * width * 4 + x * 4 + rgba] = val;
                }
                this.apply = function(ctx, x, y, width, height) {
                    let srcData = ctx.getImageData(0, 0, width, height);
                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            let r = imGet(srcData.data, x, y, width, height, 0);
                            let g = imGet(srcData.data, x, y, width, height, 1);
                            let b = imGet(srcData.data, x, y, width, height, 2);
                            let gray = (r + g + b) / 3;
                            imSet(srcData.data, x, y, width, height, 0, gray);
                            imSet(srcData.data, x, y, width, height, 1, gray);
                            imSet(srcData.data, x, y, width, height, 2, gray);
                        }
                    }
                    ctx.clearRect(0, 0, width, height);
                    ctx.putImageData(srcData, 0, 0);
                };
            };
            svg.Element.feColorMatrix.prototype = new svg.Element.ElementBase();
            svg.Element.feGaussianBlur = function(node) {
                this.base = svg.Element.ElementBase;
                this.base(node);
                this.blurRadius = Math.floor(this.attribute("stdDeviation").numValue());
                this.extraFilterDistance = this.blurRadius;
                this.apply = function(ctx, x, y, width, height) {
                    if (typeof stackBlurCanvasRGBA == "undefined") {
                        if (typeof console != "undefined") {
                            console.log("ERROR: StackBlur.js must be included for blur to work");
                        }
                        return;
                    }
                    ctx.canvas.id = svg.UniqueId();
                    ctx.canvas.style.display = "none";
                    document.body.appendChild(ctx.canvas);
                    stackBlurCanvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius);
                    document.body.removeChild(ctx.canvas);
                };
            };
            svg.Element.feGaussianBlur.prototype = new svg.Element.ElementBase();
            svg.Element.title = function(node) {};
            svg.Element.title.prototype = new svg.Element.ElementBase();
            svg.Element.desc = function(node) {};
            svg.Element.desc.prototype = new svg.Element.ElementBase();
            svg.Element.MISSING = function(node) {
                if (typeof console != "undefined") {
                    console.log("ERROR: Element '" + node.nodeName + "' not yet implemented.");
                }
            };
            svg.Element.MISSING.prototype = new svg.Element.ElementBase();
            svg.CreateElement = function(node) {
                let className = node.nodeName.replace(/^[^:]+:/, "");
                className = className.replace(/\-/g, "");
                let e = null;
                if (typeof svg.Element[className] != "undefined") {
                    e = new svg.Element[className](node);
                } else {
                    e = new svg.Element.MISSING(node);
                }
                e.type = node.nodeName;
                return e;
            };
            svg.load = function(ctx, url) {
                svg.loadXml(ctx, svg.ajax(url));
            };
            svg.loadXml = function(ctx, xml) {
                svg.loadXmlDoc(ctx, svg.parseXml(xml));
            };
            svg.loadXmlDoc = function(ctx, dom) {
                svg.init(ctx);
                let mapXY = function(p) {
                    let e = ctx.canvas;
                    while (e) {
                        p.x -= e.offsetLeft;
                        p.y -= e.offsetTop;
                        e = e.offsetParent;
                    }
                    if (window.scrollX) p.x += window.scrollX;
                    if (window.scrollY) p.y += window.scrollY;
                    return p;
                };
                if (svg.opts["ignoreMouse"] != true) {
                    ctx.canvas.onclick = function(e) {
                        let p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
                        svg.Mouse.onclick(p.x, p.y);
                    };
                    ctx.canvas.onmousemove = function(e) {
                        let p = mapXY(new svg.Point(e != null ? e.clientX : event.clientX, e != null ? e.clientY : event.clientY));
                        svg.Mouse.onmousemove(p.x, p.y);
                    };
                }
                let e = svg.CreateElement(dom.documentElement);
                e.root = true;
                let isFirstRender = true;
                let draw = function() {
                    svg.ViewPort.Clear();
                    if (ctx.canvas.parentNode) svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight);
                    if (svg.opts["ignoreDimensions"] != true) {
                        if (e.style("width").hasValue()) {
                            ctx.canvas.width = e.style("width").toPixels("x");
                            ctx.canvas.style.width = ctx.canvas.width + "px";
                        }
                        if (e.style("height").hasValue()) {
                            ctx.canvas.height = e.style("height").toPixels("y");
                            ctx.canvas.style.height = ctx.canvas.height + "px";
                        }
                    }
                    let cWidth = ctx.canvas.clientWidth || ctx.canvas.width;
                    let cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
                    if (svg.opts["ignoreDimensions"] == true && e.style("width").hasValue() && e.style("height").hasValue()) {
                        cWidth = e.style("width").toPixels("x");
                        cHeight = e.style("height").toPixels("y");
                    }
                    svg.ViewPort.SetCurrent(cWidth, cHeight);
                    if (svg.opts["offsetX"] != null) e.attribute("x", true).value = svg.opts["offsetX"];
                    if (svg.opts["offsetY"] != null) e.attribute("y", true).value = svg.opts["offsetY"];
                    if (svg.opts["scaleWidth"] != null && svg.opts["scaleHeight"] != null) {
                        let xRatio = 1, yRatio = 1, viewBox = svg.ToNumberArray(e.attribute("viewBox").value);
                        if (e.attribute("width").hasValue()) xRatio = e.attribute("width").toPixels("x") / svg.opts["scaleWidth"]; else if (!isNaN(viewBox[2])) xRatio = viewBox[2] / svg.opts["scaleWidth"];
                        if (e.attribute("height").hasValue()) yRatio = e.attribute("height").toPixels("y") / svg.opts["scaleHeight"]; else if (!isNaN(viewBox[3])) yRatio = viewBox[3] / svg.opts["scaleHeight"];
                        e.attribute("width", true).value = svg.opts["scaleWidth"];
                        e.attribute("height", true).value = svg.opts["scaleHeight"];
                        e.attribute("viewBox", true).value = "0 0 " + cWidth * xRatio + " " + cHeight * yRatio;
                        e.attribute("preserveAspectRatio", true).value = "none";
                    }
                    if (svg.opts["ignoreClear"] != true) {
                        ctx.clearRect(0, 0, cWidth, cHeight);
                    }
                    e.render(ctx);
                    if (isFirstRender) {
                        isFirstRender = false;
                        if (typeof svg.opts["renderCallback"] == "function") svg.opts["renderCallback"](dom);
                    }
                };
                let waitingForImages = true;
                if (svg.ImagesLoaded()) {
                    waitingForImages = false;
                    draw();
                }
                svg.intervalID = setInterval(function() {
                    let needUpdate = false;
                    if (waitingForImages && svg.ImagesLoaded()) {
                        waitingForImages = false;
                        needUpdate = true;
                    }
                    if (svg.opts["ignoreMouse"] != true) {
                        needUpdate = needUpdate | svg.Mouse.hasEvents();
                    }
                    if (svg.opts["ignoreAnimation"] != true) {
                        for (let i = 0; i < svg.Animations.length; i++) {
                            needUpdate = needUpdate | svg.Animations[i].update(1e3 / svg.FRAMERATE);
                        }
                    }
                    if (typeof svg.opts["forceRedraw"] == "function") {
                        if (svg.opts["forceRedraw"]() == true) needUpdate = true;
                    }
                    if (needUpdate) {
                        draw();
                        svg.Mouse.runEvents();
                    }
                }, 1e3 / svg.FRAMERATE);
            };
            svg.stop = function() {
                if (svg.intervalID) {
                    clearInterval(svg.intervalID);
                }
            };
            svg.Mouse = new function() {
                this.events = [];
                this.hasEvents = function() {
                    return this.events.length != 0;
                };
                this.onclick = function(x, y) {
                    this.events.push({
                        type: "onclick",
                        x: x,
                        y: y,
                        run: function(e) {
                            if (e.onclick) e.onclick();
                        }
                    });
                };
                this.onmousemove = function(x, y) {
                    this.events.push({
                        type: "onmousemove",
                        x: x,
                        y: y,
                        run: function(e) {
                            if (e.onmousemove) e.onmousemove();
                        }
                    });
                };
                this.eventElements = [];
                this.checkPath = function(element, ctx) {
                    for (let i = 0; i < this.events.length; i++) {
                        let e = this.events[i];
                        if (ctx.isPointInPath && ctx.isPointInPath(e.x, e.y)) this.eventElements[i] = element;
                    }
                };
                this.checkBoundingBox = function(element, bb) {
                    for (let i = 0; i < this.events.length; i++) {
                        let e = this.events[i];
                        if (bb.isPointInBox(e.x, e.y)) this.eventElements[i] = element;
                    }
                };
                this.runEvents = function() {
                    svg.ctx.canvas.style.cursor = "";
                    for (let i = 0; i < this.events.length; i++) {
                        let e = this.events[i];
                        let element = this.eventElements[i];
                        while (element) {
                            e.run(element);
                            element = element.parent;
                        }
                    }
                    this.events = [];
                    this.eventElements = [];
                };
            }();
            return svg;
        }
    }).call(target, target);
    if (typeof CanvasRenderingContext2D != "undefined") {
        CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh) {
            canvg(this.canvas, s, {
                ignoreMouse: true,
                ignoreAnimation: true,
                ignoreDimensions: true,
                ignoreClear: true,
                offsetX: dx,
                offsetY: dy,
                scaleWidth: dw,
                scaleHeight: dh
            });
        };
    }
    return canvg;
}
