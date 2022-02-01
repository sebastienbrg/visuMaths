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


const unit = (x: number, y: number, w: number, h: number, world: any) => {
    let bod = null;
    console.log("Created an attracted")
    bod = Bodies.rectangle(x, y, w, h, {
        density: 0.4,
        friction: 0.01,
        frictionAir: 0.0001,
        restitution: 0.7,
    });
    Matter.World.add(world, bod);
    return bod;
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
                myBodies2_ref.current.push(unit(canvasRef.current.clientWidth - 220 + Math.random() * 200, 40 + Math.random() * 40, UnitWidth, UnitHeight, engine_ref.current.world));
            }
        }
        return () => {
            if (myBodies2_ref.current) {
                myBodies2_ref.current.forEach(b => Matter.World.remove(engine_ref.current.world, b))
                myBodies2_ref.current = [];
            }
        }
    }, [myBodies_ref, engine_ref, secondNumber])

    function attachTwoUnits(unit1, unit2, word) {
        const options = {
            bodyA: unit1,
            bodyB: unit2,
            pointA: {x: -20, y: 20},
            pointB: {x: -20, y: 20},
            style: "spring",
            length: 2,
            stiffness: 0.6
        }
        const constraint1 = Matter.Constraint.create(options);
        const options2 = {...options};
        options2.pointA = {x: -20, y: -20};
        options2.pointB = {x: 20, y: 20};
        const constraint2 = Matter.Constraint.create(options2);
        Matter.World.add(engine_ref.current.world, [constraint1, constraint2]);
    }

    useEffect(() => {

        setTimeout(() => {
            const groupCount = Math.floor(firstNumber / 10);
            for (let groupIndex = 0; groupIndex < groupCount; ++groupIndex) {
                for (let itemIndex = 1; itemIndex < 10; ++itemIndex) {
                    attachTwoUnits(myBodies_ref.current[groupIndex * 10 + itemIndex - 1],
                        myBodies_ref.current[groupIndex * 10 + itemIndex],
                        engine_ref.current.world)
                }
            }
            // console.log(engine_ref.current.world.bodies, myBodies_ref.current);
            // Matter.Body.setStatic(myBodies_ref.current[0], true);
            // const options = {
            //     bodyA: myBodies_ref.current[0],
            //     bodyB: myBodies_ref.current[1],
            //     pointA: {x: -20, y: 20},
            //     pointB: {x: -20, y: 20},
            //     style: "spring",
            //     length: 2,
            //     stiffness: 0.6
            // }
            // const constraint1 = Matter.Constraint.create(options);
            // const options2 = {...options};
            // options2.pointA = {x: -20, y: -20};
            // options2.pointB = {x: 20, y: 20};
            // const constraint2 = Matter.Constraint.create(options2);
            // Matter.World.add(engine_ref.current.world, [constraint1, constraint2]);
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