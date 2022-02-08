import { useEffect, useRef, useState } from "react";
import Matter from "matter-js"



const unitBody = (x: number, y: number, w: number, h: number, world: any) => {
    let bod = null;
    bod = Matter.Bodies.rectangle(x, y, w, h, {
        density: 0.4,
        friction: 0.1,
        frictionAir: 0.01,
        restitution: 0.4,
    });
    Matter.World.add(world, bod);
    return bod;
}

const UnitWidth = 15;
const UnitHeight = 10;

const StackMargin = 10;

class Unit {
    body: Matter.Body;
    constructor(x: number, y: number, world: Matter.World) {
        this.body = unitBody(x, y, UnitWidth, UnitHeight, world);
    }
}

class NumberWrapper {
    value: number = 0
    world: Matter.World = null
    units: Unit[] = []
    the_composite = Matter.Composite.create();
    clientSize: { w: number, h: number } = { w: 0, h: 0 }
    percentageX: number = 10;
    percentageY: number = 10;

    constructor(value, percentX, percentY) {
        this.value = value;
        this.percentageX = percentX
        this.percentageY = percentY
    }
    setValue(newValue) {
        this.value = newValue
    }
    setWorld(world) {
        this.resetContent();
        this.world = world;
        this.createBodies();
        const w = this.clientSize.w;
        this.clientSize.w = 0;
        this.updateClientSize(w, this.clientSize.h)

    }
    createContainer() {
        //this.the_composite

        let bod = null;
        bod = Matter.Bodies.rectangle(0, 0, 300, h, {
            density: 0.4,
            friction: 0.1,
            frictionAir: 0.01,
            restitution: 0.4,
        });
        Matter.World.add(world, bod);
    }
    createBodies() {
        if (this.world) {
            this.createContainer();
            this.createUnits();
            Matter.World.add(this.world, this.the_composite);
        }
    }
    createUnits() {
        if (this.world) {
            for (let i = 0; i < this.value; ++i) {
                console.log("creating unit ", i)
                const unit = new Unit(-99 + Math.random() * 198,
                    40 + Math.random() * 40,
                    this.world);
                this.units.push(unit);
                Matter.Composite.add(this.the_composite, unit.body);
            }
            Matter.World.add(this.world, this.the_composite);
        }
    }
    updateClientSize(witdth: number, height: number) {

        console.log("translating", witdth, height)
        if (this.clientSize.w === 0 || this.clientSize.w !== witdth || this.clientSize.h !== height) {
            if (this.clientSize.w !== 0) {
                Matter.Composite.translate(this.the_composite,
                    {
                        x: this.clientSize.w * this.percentageX * -1,
                        y: this.clientSize.h * this.percentageY * -1
                    })
            }
            this.clientSize.w = witdth;
            this.clientSize.h = height;

            Matter.Composite.translate(this.the_composite,
                {
                    x: this.clientSize.w * this.percentageX,
                    y: this.clientSize.h * this.percentageY
                })

        }
    }
    resetContent() {

    }
}
function attachTwoUnits(unit1, unit2, world) {
    const options = {
        bodyA: unit1,
        bodyB: unit2,
        pointA: { x: -UnitWidth / 2, y: UnitHeight / 2 - 1 },
        pointB: { x: -UnitWidth / 2, y: -UnitHeight / 2 + 1 },
        style: "spring",
        length: 2 + StackMargin,
        stiffness: 0.2,
        damping: .6
    }
    const constraint1 = Matter.Constraint.create(options);
    const options2 = { ...options };
    options2.pointA = { x: UnitWidth / 2, y: (+UnitHeight / 2 + 1) };
    options2.pointB = { x: UnitWidth / 2, y: -UnitHeight / 2 + 1 };
    const constraint2 = Matter.Constraint.create(options2);
    Matter.World.add(world, [constraint1, constraint2]);
}



function putBodyFlat(the_bod: any, delay: number) {
    setTimeout(() => {
        Matter.Body.setAngularVelocity(the_bod, 0);
        Matter.Body.setAngle(the_bod, 0);
    }, delay);
}

const World = () => {
    const canvasRef = useRef<any>(null);
    const [firstNumber, setFirstNumber] = useState<NumberWrapper | null>(new NumberWrapper(22, 0, 0));
    const [secondNumber, setSecondNumber] = useState<NumberWrapper | null>(new NumberWrapper(9, 80, 0));
    const engine_ref = useRef<any>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const CanWidth = canvasRef.current.clientWidth;
            const CanHeight = canvasRef.current.clientHeight;


            // create an engine
            var engine = Matter.Engine.create();

            // create a renderer
            var render = Matter.Render.create({
                element: canvasRef.current,
                engine: engine,
                options: {
                    height: CanHeight,
                    width: CanWidth,
                    wireframes: false,
                    showAngleIndicator: true
                }
            });
            engine.world.gravity.scale = 0.0001;

            // create two boxes and a ground
            const ground = Matter.Bodies.rectangle(CanWidth / 2, CanHeight - 20, CanWidth + 100, 60, { isStatic: true });
            const wallLeft = Matter.Bodies.rectangle(5, CanHeight / 2, 10, CanHeight, {
                isStatic: true,
                render: {
                    visible: false
                }
            });
            const wallRight = Matter.Bodies.rectangle(CanWidth - 5, CanHeight / 2, 10, CanHeight, {
                isStatic: true,
                render: {
                    visible: false
                }
            });
            Matter.Composite.add(engine.world, [ground, wallLeft, wallRight]);

            var mouseConstraint = Matter.MouseConstraint.create(engine, { //Create Constraint
                element: canvasRef.current,
                constraint: {
                    render: {
                        visible: false
                    },
                    stiffness: 0.8
                }
            } as any);
            Matter.World.add(engine.world, mouseConstraint);

            engine_ref.current = engine;
            // run the renderer
            Matter.Render.run(render);

            // create runner
            var runner = Matter.Runner.create();
            firstNumber.setWorld(engine.world);
            secondNumber.setWorld(engine.world);

            // run the engine
            Matter.Runner.run(runner, engine);
        }

        return () => {
            Matter.World.clear(engine.world, false);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            render.canvas = null;
            render.context = null;
            render.textures = {};
        }
    }, []);
    useEffect(() => {
        if (canvasRef.current) {
            const CanWidth = canvasRef.current.clientWidth;
            const CanHeight = canvasRef.current.clientHeight;
            firstNumber.updateClientSize(CanWidth, CanHeight);
            secondNumber.updateClientSize(CanWidth, CanHeight);
        }
    }, [canvasRef]);

    /*
        useEffect(() => {
            if (engine_ref.current) {
    
                for (let i = 0; i < firstNumber.value; ++i) {
                    myBodies_ref.current.push(unit(220 - Math.random() * 200, 40 + Math.random() * 40, UnitWidth, UnitHeight, engine_ref.current.world));
                }
            }
            return () => {
                if (myBodies_ref.current) {
                    myBodies_ref.current.forEach(b => Matter.World.remove(engine_ref.current.world, b))
                    myBodies_ref.current = [];
                }
            }
        }, [myBodies_ref, engine_ref, firstNumber])
    */
    /*
useEffect(() => {

    setTimeout(() => {
        const groupCount = Math.floor(firstNumber.value / 10);
        for (let groupIndex = 0; groupIndex < groupCount; ++groupIndex) {
            for (let itemIndex = 0; itemIndex < 10; ++itemIndex) {
                const the_bod = myBodies_ref.current[groupIndex * 10 + itemIndex];
                if (itemIndex === 0) {
                    Matter.Body.setPosition(the_bod, {
                        x: (groupIndex + 1) * 2 * UnitWidth,
                        y: canvasRef.current.clientHeight - 100 - (UnitHeight + StackMargin) * 10
                    })
                    Matter.Body.setStatic(the_bod, true);
                } else {
                    const the_prev_bod = myBodies_ref.current[groupIndex * 10 + itemIndex - 1];
                    attachTwoUnits(the_prev_bod, the_bod,
                        engine_ref.current.world)
                    if (itemIndex === 9) {
                        Matter.Body.setPosition(the_bod, {
                            x: (groupIndex + 1) * 2 * UnitWidth,
                            y: canvasRef.current.clientHeight - 100
                        })
                        Matter.Body.setStatic(the_bod, true);
                    }
                }
                Matter.Body.set(the_bod, { collisionFilter: { group: 1 + itemIndex } })
                putBodyFlat(the_bod, 1000)
                putBodyFlat(the_bod, 2000)
                //Matter.Body.update(the_bod)
            }
        }
    }, 4000000)
});
*/
    //style={{ width: "" + CanWidth + "px", height: "" + CanHeight + "px", overflow: "auto" }}
    return <div style={{ height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
            <input type={"number"} value={firstNumber.value} onChange={e => {
                const val = parseInt(e.target.value)
                firstNumber.setValue(val);
            }
            } />
            <div>+</div>
            <input type={"number"} value={secondNumber.value} onChange={e => {
                const val = parseInt(e.target.value)
                secondNumber.setValue(val);
            }
            } />
        </div>
        <div style={{ height: "100%" }} ref={canvasRef}></div>
    </div>
}

export default World;