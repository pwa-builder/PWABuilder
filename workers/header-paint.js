// implementation based on https://github.com/bramus/css-houdini-circles

class CirclesPainter {

    static get inputProperties() {
        return [
            '--colors',
            '--min-radius',
            '--max-radius',
            '--min-opacity',
            '--max-opacity',
            '--num-circles',
        ]
    }

    parseProps(props) {
        return [
            '--colors',
            '--min-radius',
            '--max-radius',
            '--min-opacity',
            '--max-opacity',
            '--num-circles',
        ].map(prop => {
            if (!props.get(prop).length) {
                return undefined;
            }

            if (prop == '--colors') {
                return props.get(prop).toString().split(',').map(color => color.trim());
            } else {
                return parseInt(props.get(prop).toString());
            }
        });
    }

    paint(ctx, geom, props) {
        const { width: w, height: h } = geom;
        const [
            colors = ['#71a7ee', '#7940c1'],
            minRadius = 10,
            maxRadius = 50,
            minOpacity = 10,
            maxOpacity = 80,
            numCircles = 5
        ] = this.parseProps(props);

        for (let i = 0, max = numCircles; i < max; i++) {
            this.drawCircle(ctx, {
                x: this.rand(0, w),
                y: this.rand(0, h),
                r: this.rand(minRadius, maxRadius),
                color: colors[this.rand(0, colors.length - 1)],
                alpha: this.rand(minOpacity, maxOpacity),
            });
        }

    }

    drawCircle(ctx, circle) {
        ctx.globalAlpha = circle.alpha / 100;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2, true);

        ctx.fillStyle = circle.color;
        ctx.fill();
        ctx.closePath();
    }

    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

// eslint-disable-next-line no-undef
registerPaint('circles', CirclesPainter);