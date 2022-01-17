import { useEffect, useRef, useState } from "react";
import Matter from "matter-js"
Matter.use('matter-attractors');

const CanWidth = 1200;
const CanHeight = 800;
const World = () => {
    const canvasRef = useRef<any>(null);
    const [firstNumber, setFirstNumber] = useState<number>(400);
    useEffect(() => {
        if (canvasRef.current) {
            const CanWidth = canvasRef.current.clientWidth;
            const CanHeight = canvasRef.current.clientHeight;

            console.log("It's here ", canvasRef.current.clientWidth, canvasRef.current.clientHeight)
            // module aliases
            var Engine = Matter.Engine,
                Render = Matter.Render,
                Runner = Matter.Runner,
                Bodies = Matter.Bodies,
                Composite = Matter.Composite;

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
            engine.world.gravity.scale = 0;

            // create two boxes and a ground
            var ground = Bodies.rectangle(CanWidth / 2, CanHeight - 20, CanWidth + 100, 60, { isStatic: true });

            const allBodies = [];

            const cercle = (x: number, y: number, rayon: number) => {
                allBodies.push(Bodies.circle(x, y, rayon,{
                    density: 0.4,
                    friction: 0.01,
                    frictionAir: 0.00001,
                    restitution: 1,
                    render: {
                      fillStyle: '#F35e66',
                      strokeStyle: 'black',
                      lineWidth: 1
                    }
                  }));
            }
            const carre = (x: number, y: number, largeur: number) => {
                allBodies.push(Bodies.rectangle(x, y, largeur, largeur,{
                    density: 0.4,
                    friction: 0.01,
                    frictionAir: 0.00001,
                    restitution: 1,
                  }));
            }
            const attractor = Bodies.rectangle(CanWidth/3, 50, 40, 40, {
                isStatic: true,
                density: 1,
                plugin: {
                    attractors: [
                      function(bodyA : any, bodyB : any) {
                        return {
                          x: (bodyA.position.x - bodyB.position.x) * 1e-4,
                          y: (bodyA.position.y - bodyB.position.y) * 1e-4,
                        };
                      }
                    ]
                  }
            })
            allBodies.push(attractor)

            // Exemples
            //cercle(10, 10, 10);
            carre(CanWidth/2 - 50, 40, 40);
            //cercle(1160, 10, 10);
            // Ecris la dessous
            carre(CanWidth/2 + 50, 40, 40);

            var mouseConstraint = Matter.MouseConstraint.create(engine, { //Create Constraint
                element: canvasRef.current,
                constraint: {
                  render: {
                    visible: false
                  },
                  stiffness:0.8
                }
              } as any);
              Matter.World.add(engine.world, mouseConstraint);


            allBodies.push(ground);

            // add all of the bodies to the world
            Composite.add(engine.world, allBodies);

            // run the renderer
            Render.run(render);

            // create runner
            var runner = Runner.create();

            // run the engine
            Runner.run(runner, engine);
        }

        return () => {

        }
    }, []);
    //style={{ width: "" + CanWidth + "px", height: "" + CanHeight + "px", overflow: "auto" }} 
    return <div style={{height:"100%"}} ref={canvasRef}> </div>
}

export default World;