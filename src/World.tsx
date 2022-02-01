import {useEffect, useRef, useState} from "react";
import Matter from "matter-js"

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

const UnitWidth = 30;
const UnitHeight = 20;

const StackMargin = 10;

function attachTwoUnits(unit1, unit2, world) {
    const options = {
        bodyA: unit1,
        bodyB: unit2,
        pointA: {x: -UnitWidth / 2, y: UnitHeight / 2 - 1},
        pointB: {x: -UnitWidth / 2, y: -UnitHeight / 2 + 1},
        style: "spring",
        length: 2 + StackMargin,
        stiffness: 0.2,
        damping: .6
    }
    const constraint1 = Matter.Constraint.create(options);
    const options2 = {...options};
    options2.pointA = {x: UnitWidth / 2, y: (+UnitHeight / 2 + 1)};
    options2.pointB = {x: UnitWidth / 2, y: -UnitHeight / 2 + 1};
    const constraint2 = Matter.Constraint.create(options2);
    Matter.World.add(world, [constraint1, constraint2]);
}

const unit = (x: number, y: number, w: number, h: number, world: any) => {
    let bod = null;
    console.log("Created an attracted")
    bod = Bodies.rectangle(x, y, w, h, {
        density: 0.4,
        friction: 0.1,
        frictionAir: 0.01,
        restitution: 0.4,
    });
    Matter.World.add(world, bod);
    return bod;
}

function putBodyFlat(the_bod: any, delay: number) {
    setTimeout(() => {
        Matter.Body.setAngularVelocity(the_bod, 0);
        Matter.Body.setAngle(the_bod, 0);
    }, delay);
}

const World = () => {
    const canvasRef = useRef<any>(null);
    const [firstNumber, setFirstNumber] = useState<number>(22);
    const [secondNumber, setSecondNumber] = useState<number>(22);
    const engine_ref = useRef<any>(null);
    const myBodies_ref = useRef<any[]>([]);
    const myBodies2_ref = useRef<any[]>([]);
    useEffect(() => {
        if (canvasRef.current) {
            const CanWidth = canvasRef.current.clientWidth;
            const CanHeight = canvasRef.current.clientHeight;


            // create an engine
            var engine = Engine.create();

            // create a renderer
            var render = Render.create({
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
            const ground = Bodies.rectangle(CanWidth / 2, CanHeight - 20, CanWidth + 100, 60, {isStatic: true});
            const wallLeft = Bodies.rectangle(5, CanHeight / 2, 10, CanHeight, {
                isStatic: true,
                render: {
                    visible: false
                }
            });
            const wallRight = Bodies.rectangle(CanWidth - 5, CanHeight / 2, 10, CanHeight, {
                isStatic: true,
                render: {
                    visible: false
                }
            });
            Composite.add(engine.world, [ground, wallLeft, wallRight]);

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
            Render.run(render);

            // create runner
            var runner = Runner.create();

            // run the engine
            Runner.run(runner, engine);
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
        if (engine_ref.current) {

            for (let i = 0; i < firstNumber; ++i) {
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

    useEffect(() => {
        if (engine_ref.current) {
            for (let i = 0; i < secondNumber; ++i) {
                myBodies2_ref.current.push(unit(canvasRef.current.clientWidth - 220 + Math.random() * 200,
                    40 + Math.random() * 40,
                    UnitWidth,
                    UnitHeight,
                    engine_ref.current.world));
            }
        }
        return () => {
            if (myBodies2_ref.current) {
                myBodies2_ref.current.forEach(b => Matter.World.remove(engine_ref.current.world, b))
                myBodies2_ref.current = [];
            }
        }
    }, [myBodies_ref, engine_ref, secondNumber])


    useEffect(() => {

        setTimeout(() => {
            const groupCount = Math.floor(firstNumber / 10);
            for (let groupIndex = 0; groupIndex < groupCount; ++groupIndex) {
                for (let itemIndex = 0; itemIndex < 10; ++itemIndex) {
                    const the_bod = myBodies_ref.current[groupIndex * 10 + itemIndex];
                    if (itemIndex === 0) {
                        Matter.Body.setPosition(the_bod, {
                            x: (groupIndex + 1) * 2 * UnitWidth,
                            y: canvasRef.current.clientHeight -100 - (UnitHeight+StackMargin) * 10
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
                    Matter.Body.set(the_bod, {collisionFilter: {group: 1 + itemIndex}})
                    putBodyFlat(the_bod, 1000)
                    putBodyFlat(the_bod, 2000)
                    //Matter.Body.update(the_bod)
                }
            }
        }, 4000)
    })
    ;
//style={{ width: "" + CanWidth + "px", height: "" + CanHeight + "px", overflow: "auto" }}
    return <div style={{height: "100%"}}>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
            <input type={"number"} value={firstNumber} onChange={e => {
                const val = parseInt(e.target.value)
                setFirstNumber(val);
            }
            }/>
            <div>+</div>
            <input type={"number"} value={secondNumber} onChange={e => {
                const val = parseInt(e.target.value)
                setSecondNumber(val);
            }
            }/>
        </div>
        <div style={{height: "100%"}} ref={canvasRef}></div>
    </div>
}

export default World;