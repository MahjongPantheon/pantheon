import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { ActionManager } from '@babylonjs/core/Actions/actionManager';
import { CSG } from '@babylonjs/core/Meshes/csg';
import { N_TileValue } from '#/generated/njord.pb';
import { res } from '#/resources';

export class Tile {
  private readonly _rootNode: TransformNode;
  private _meshes: Mesh[] = [];
  private _actionManager?: ActionManager;
  private _type: N_TileValue = 'NIL';
  public static readonly H = 3.2;
  public static readonly W = 2.4;
  public static readonly D = 1.6;

  private static _clonableBaseMesh: [Mesh, Mesh] | null = null;
  protected static getBase(): [Mesh, Mesh] {
    if (!Tile._clonableBaseMesh) {
      const boxBase = new RoundedBox(3, new Vector3(Tile.H, Tile.D, Tile.W), 0.2);
      const base = boxBase.toMesh('base');
      base.material = res.mat.tileBase;
      const baseCsg = CSG.FromMesh(base);

      const backBase = new RoundedBox(3, new Vector3(Tile.H, Tile.D, Tile.W), 0.2);
      const back = backBase.toMesh('back');
      back.material = res.mat.tileBack;
      const backCsg = CSG.FromMesh(back);

      const cropBox = MeshBuilder.CreateBox('crop', {
        width: Tile.H * 2,
        height: Tile.W * 2,
        depth: Tile.D * 2,
      });
      cropBox.position.y = -2.9;
      const cropCsg = CSG.FromMesh(cropBox);

      const baseCropped = baseCsg.subtract(cropCsg).toMesh('csg_base', res.mat.tileBase);
      const backCropped = backCsg.intersect(cropCsg).toMesh('csg_back', res.mat.tileBack);
      Tile._clonableBaseMesh = [baseCropped, backCropped];

      base.dispose();
      back.dispose();
      cropBox.dispose();
      baseCropped.getScene().removeMesh(baseCropped);
      backCropped.getScene().removeMesh(backCropped);
    }

    return Tile._clonableBaseMesh.map((m) => m.clone()) as [Mesh, Mesh];
  }

  public constructor() {
    const tileValue = MeshBuilder.CreatePlane('val', {
      size: 1,
      width: Tile.H * 0.8,
      height: Tile.W * 0.8,
    });
    tileValue.rotation.x = Math.PI / 2;
    tileValue.position.y = Tile.D * 0.505;
    this._meshes.push(tileValue);

    const [base, back] = Tile.getBase();
    this._meshes.push(base);
    this._meshes.push(back);

    this._rootNode = new TransformNode('tile');
    this._meshes.forEach((n) => (n.parent = this._rootNode));
  }

  public static new(type: N_TileValue, aka?: boolean): Tile {
    return new Tile().setType(type, aka);
  }

  public getType(): N_TileValue {
    return this._type;
  }

  public setType(type: N_TileValue, aka?: boolean): Tile {
    const mat = aka ? res.mat.tileValuesAka[type] : res.mat.tileValues[type];
    if (mat) {
      this._type = type;
      this._meshes[0].material = mat;
    }
    return this;
  }

  get visibility() {
    return this._meshes[0].visibility;
  }

  set visibility(v: number) {
    this._meshes.forEach((m) => {
      m.visibility = v;
    });
  }

  public getRoot() {
    return this._rootNode;
  }

  public setActionManager(m: ActionManager) {
    this._actionManager = m;
    this._meshes.forEach((m) => {
      m.actionManager = this._actionManager!;
    });
    return this._actionManager;
  }

  public addToScene(scene: Scene): Tile {
    this._meshes.forEach((n) => scene.addMesh(n));
    scene.addTransformNode(this._rootNode);
    return this;
  }

  public dispose() {
    this._meshes.forEach((m) => {
      m.actionManager = null;
      m.dispose();
    });
    this._actionManager?.dispose();
    this._rootNode.dispose();
  }
}

class RoundedBox {
  private vertices: Vector3[];
  private indices: Vector3[];
  private normals: Vector3[];
  private m_nEdge: number;
  private m_index_to_verts: number[];
  private m_radius: number;

  constructor(N: number, dimension: Vector3, radius: number) {
    this.vertices = [];
    this.indices = [];
    this.normals = [];

    let b = dimension.divide(new Vector3(2, 2, 2)).add(new Vector3(-radius, -radius, -radius));

    let nEdge = 2 * (N + 1);
    this.m_nEdge = nEdge;
    this.m_index_to_verts = Array(nEdge * nEdge * nEdge).fill(-1);
    this.m_radius = radius;
    let dx = radius / N;

    let sign = [-1.0, 1.0];
    let ks = [0, N * 2 + 1];

    // xy-planes
    for (let kidx = 0; kidx < 2; ++kidx) {
      let k = ks[kidx];
      let origin = new Vector3(-b.x - radius, -b.y - radius, (b.z + radius) * sign[kidx]);
      for (let j = 0; j <= N; ++j) {
        for (let i = 0; i <= N; ++i) {
          let pos = origin.add(new Vector3(dx * i, dx * j, 0.0));
          this.addVertex(i, j, k, pos, new Vector3(-b.x, -b.y, b.z * sign[kidx]));

          pos = origin.add(new Vector3(dx * i + 2.0 * b.x + radius, dx * j, 0.0));
          this.addVertex(i + N + 1, j, k, pos, new Vector3(b.x, -b.y, b.z * sign[kidx]));

          pos = origin.add(
            new Vector3(dx * i + 2.0 * b.x + radius, dx * j + 2.0 * b.y + radius, 0.0)
          );
          this.addVertex(i + N + 1, j + N + 1, k, pos, new Vector3(b.x, b.y, b.z * sign[kidx]));

          pos = origin.add(new Vector3(dx * i, dx * j + 2.0 * b.y + radius, 0.0));
          this.addVertex(i, j + N + 1, k, pos, new Vector3(-b.x, b.y, b.z * sign[kidx]));
        }
      }
      // corners
      for (let j = 0; j < N; ++j) {
        for (let i = 0; i < N; ++i) {
          this.addFace(
            this.translateIndices(i, j, k),
            this.translateIndices(i + 1, j + 1, k),
            this.translateIndices(i, j + 1, k),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(i, j, k),
            this.translateIndices(i + 1, j, k),
            this.translateIndices(i + 1, j + 1, k),
            kidx === 0
          );

          this.addFace(
            this.translateIndices(i, j + N + 1, k),
            this.translateIndices(i + 1, j + N + 2, k),
            this.translateIndices(i, j + N + 2, k),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(i, j + N + 1, k),
            this.translateIndices(i + 1, j + N + 1, k),
            this.translateIndices(i + 1, j + N + 2, k),
            kidx === 0
          );

          this.addFace(
            this.translateIndices(i + N + 1, j + N + 1, k),
            this.translateIndices(i + N + 2, j + N + 2, k),
            this.translateIndices(i + N + 1, j + N + 2, k),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(i + N + 1, j + N + 1, k),
            this.translateIndices(i + N + 2, j + N + 1, k),
            this.translateIndices(i + N + 2, j + N + 2, k),
            kidx === 0
          );

          this.addFace(
            this.translateIndices(i + N + 1, j, k),
            this.translateIndices(i + N + 2, j + 1, k),
            this.translateIndices(i + N + 1, j + 1, k),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(i + N + 1, j, k),
            this.translateIndices(i + N + 2, j, k),
            this.translateIndices(i + N + 2, j + 1, k),
            kidx === 0
          );
        }
      }
      // sides
      for (let i = 0; i < N; ++i) {
        this.addFace(
          this.translateIndices(i, N, k),
          this.translateIndices(i + 1, N + 1, k),
          this.translateIndices(i, N + 1, k),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(i, N, k),
          this.translateIndices(i + 1, N, k),
          this.translateIndices(i + 1, N + 1, k),
          kidx === 0
        );

        this.addFace(
          this.translateIndices(N, i, k),
          this.translateIndices(N + 1, i + 1, k),
          this.translateIndices(N, i + 1, k),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(N, i, k),
          this.translateIndices(N + 1, i, k),
          this.translateIndices(N + 1, i + 1, k),
          kidx === 0
        );

        this.addFace(
          this.translateIndices(i + N + 1, N, k),
          this.translateIndices(i + N + 2, N + 1, k),
          this.translateIndices(i + N + 1, N + 1, k),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(i + N + 1, N, k),
          this.translateIndices(i + N + 2, N, k),
          this.translateIndices(i + N + 2, N + 1, k),
          kidx === 0
        );

        this.addFace(
          this.translateIndices(N, i + N + 1, k),
          this.translateIndices(N + 1, i + N + 2, k),
          this.translateIndices(N, i + N + 2, k),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(N, i + N + 1, k),
          this.translateIndices(N + 1, i + N + 1, k),
          this.translateIndices(N + 1, i + N + 2, k),
          kidx === 0
        );
      }
      // central
      this.addFace(
        this.translateIndices(N, N, k),
        this.translateIndices(N + 1, N + 1, k),
        this.translateIndices(N, N + 1, k),
        kidx === 0
      );
      this.addFace(
        this.translateIndices(N, N, k),
        this.translateIndices(N + 1, N, k),
        this.translateIndices(N + 1, N + 1, k),
        kidx === 0
      );
    }

    // xz-planes
    for (let kidx = 0; kidx < 2; ++kidx) {
      let k = ks[kidx];
      let origin = new Vector3(-b.x - radius, (b.y + radius) * sign[kidx], -b.z - radius);
      for (let j = 0; j <= N; ++j) {
        for (let i = 0; i <= N; ++i) {
          let pos = origin.add(new Vector3(dx * i, 0.0, dx * j));
          this.addVertex(i, k, j, pos, new Vector3(-b.x, b.y * sign[kidx], -b.z));

          pos = origin.add(new Vector3(dx * i + 2.0 * b.x + radius, 0.0, dx * j));
          this.addVertex(i + N + 1, k, j, pos, new Vector3(b.x, b.y * sign[kidx], -b.z));

          pos = origin.add(
            new Vector3(dx * i + 2.0 * b.x + radius, 0.0, dx * j + 2.0 * b.z + radius)
          );
          this.addVertex(i + N + 1, k, j + N + 1, pos, new Vector3(b.x, b.y * sign[kidx], b.z));

          pos = origin.add(new Vector3(dx * i, 0.0, dx * j + 2.0 * b.z + radius));
          this.addVertex(i, k, j + N + 1, pos, new Vector3(-b.x, b.y * sign[kidx], b.z));
        }
      }
      // corners
      for (let j = 0; j < N; ++j) {
        for (let i = 0; i < N; ++i) {
          this.addFace(
            this.translateIndices(i, k, j),
            this.translateIndices(i + 1, k, j + 1),
            this.translateIndices(i, k, j + 1),
            kidx === 1
          );
          this.addFace(
            this.translateIndices(i, k, j),
            this.translateIndices(i + 1, k, j),
            this.translateIndices(i + 1, k, j + 1),
            kidx === 1
          );

          this.addFace(
            this.translateIndices(i, k, j + N + 1),
            this.translateIndices(i + 1, k, j + N + 2),
            this.translateIndices(i, k, j + N + 2),
            kidx === 1
          );
          this.addFace(
            this.translateIndices(i, k, j + N + 1),
            this.translateIndices(i + 1, k, j + N + 1),
            this.translateIndices(i + 1, k, j + N + 2),
            kidx === 1
          );

          this.addFace(
            this.translateIndices(i + N + 1, k, j + N + 1),
            this.translateIndices(i + N + 2, k, j + N + 2),
            this.translateIndices(i + N + 1, k, j + N + 2),
            kidx === 1
          );
          this.addFace(
            this.translateIndices(i + N + 1, k, j + N + 1),
            this.translateIndices(i + N + 2, k, j + N + 1),
            this.translateIndices(i + N + 2, k, j + N + 2),
            kidx === 1
          );

          this.addFace(
            this.translateIndices(i + N + 1, k, j),
            this.translateIndices(i + N + 2, k, j + 1),
            this.translateIndices(i + N + 1, k, j + 1),
            kidx === 1
          );
          this.addFace(
            this.translateIndices(i + N + 1, k, j),
            this.translateIndices(i + N + 2, k, j),
            this.translateIndices(i + N + 2, k, j + 1),
            kidx === 1
          );
        }
      }
      // sides
      for (let i = 0; i < N; ++i) {
        this.addFace(
          this.translateIndices(i, k, N),
          this.translateIndices(i + 1, k, N + 1),
          this.translateIndices(i, k, N + 1),
          kidx === 1
        );
        this.addFace(
          this.translateIndices(i, k, N),
          this.translateIndices(i + 1, k, N),
          this.translateIndices(i + 1, k, N + 1),
          kidx === 1
        );

        this.addFace(
          this.translateIndices(N, k, i),
          this.translateIndices(N + 1, k, i + 1),
          this.translateIndices(N, k, i + 1),
          kidx === 1
        );
        this.addFace(
          this.translateIndices(N, k, i),
          this.translateIndices(N + 1, k, i),
          this.translateIndices(N + 1, k, i + 1),
          kidx === 1
        );

        this.addFace(
          this.translateIndices(i + N + 1, k, N),
          this.translateIndices(i + N + 2, k, N + 1),
          this.translateIndices(i + N + 1, k, N + 1),
          kidx === 1
        );
        this.addFace(
          this.translateIndices(i + N + 1, k, N),
          this.translateIndices(i + N + 2, k, N),
          this.translateIndices(i + N + 2, k, N + 1),
          kidx === 1
        );

        this.addFace(
          this.translateIndices(N, k, i + N + 1),
          this.translateIndices(N + 1, k, i + N + 2),
          this.translateIndices(N, k, i + N + 2),
          kidx === 1
        );
        this.addFace(
          this.translateIndices(N, k, i + N + 1),
          this.translateIndices(N + 1, k, i + N + 1),
          this.translateIndices(N + 1, k, i + N + 2),
          kidx === 1
        );
      }
      // central
      this.addFace(
        this.translateIndices(N, k, N),
        this.translateIndices(N + 1, k, N + 1),
        this.translateIndices(N, k, N + 1),
        kidx === 1
      );
      this.addFace(
        this.translateIndices(N, k, N),
        this.translateIndices(N + 1, k, N),
        this.translateIndices(N + 1, k, N + 1),
        kidx === 1
      );
    }

    // yz-planes
    for (let kidx = 0; kidx < 2; ++kidx) {
      let k = ks[kidx];
      let origin = new Vector3((b.x + radius) * sign[kidx], -b.y - radius, -b.z - radius);
      for (let j = 0; j <= N; ++j) {
        for (let i = 0; i <= N; ++i) {
          let pos = origin.add(new Vector3(0.0, dx * i, dx * j));
          this.addVertex(k, i, j, pos, new Vector3(b.x * sign[kidx], -b.y, -b.z));

          pos = origin.add(new Vector3(0.0, dx * i + 2.0 * b.y + radius, dx * j));
          this.addVertex(k, i + N + 1, j, pos, new Vector3(b.x * sign[kidx], b.y, -b.z));

          pos = origin.add(
            new Vector3(0.0, dx * i + 2.0 * b.y + radius, dx * j + 2.0 * b.z + radius)
          );
          this.addVertex(k, i + N + 1, j + N + 1, pos, new Vector3(b.x * sign[kidx], b.y, b.z));

          pos = origin.add(new Vector3(0.0, dx * i, dx * j + 2.0 * b.z + radius));
          this.addVertex(k, i, j + N + 1, pos, new Vector3(b.x * sign[kidx], -b.y, b.z));
        }
      }
      // corners
      for (let j = 0; j < N; ++j) {
        for (let i = 0; i < N; ++i) {
          this.addFace(
            this.translateIndices(k, i, j),
            this.translateIndices(k, i + 1, j + 1),
            this.translateIndices(k, i, j + 1),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(k, i, j),
            this.translateIndices(k, i + 1, j),
            this.translateIndices(k, i + 1, j + 1),
            kidx === 0
          );

          this.addFace(
            this.translateIndices(k, i, j + N + 1),
            this.translateIndices(k, i + 1, j + N + 2),
            this.translateIndices(k, i, j + N + 2),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(k, i, j + N + 1),
            this.translateIndices(k, i + 1, j + N + 1),
            this.translateIndices(k, i + 1, j + N + 2),
            kidx === 0
          );

          this.addFace(
            this.translateIndices(k, i + N + 1, j + N + 1),
            this.translateIndices(k, i + N + 2, j + N + 2),
            this.translateIndices(k, i + N + 1, j + N + 2),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(k, i + N + 1, j + N + 1),
            this.translateIndices(k, i + N + 2, j + N + 1),
            this.translateIndices(k, i + N + 2, j + N + 2),
            kidx === 0
          );

          this.addFace(
            this.translateIndices(k, i + N + 1, j),
            this.translateIndices(k, i + N + 2, j + 1),
            this.translateIndices(k, i + N + 1, j + 1),
            kidx === 0
          );
          this.addFace(
            this.translateIndices(k, i + N + 1, j),
            this.translateIndices(k, i + N + 2, j),
            this.translateIndices(k, i + N + 2, j + 1),
            kidx === 0
          );
        }
      }
      // sides
      for (let i = 0; i < N; ++i) {
        this.addFace(
          this.translateIndices(k, i, N),
          this.translateIndices(k, i + 1, N + 1),
          this.translateIndices(k, i, N + 1),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(k, i, N),
          this.translateIndices(k, i + 1, N),
          this.translateIndices(k, i + 1, N + 1),
          kidx === 0
        );

        this.addFace(
          this.translateIndices(k, N, i),
          this.translateIndices(k, N + 1, i + 1),
          this.translateIndices(k, N, i + 1),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(k, N, i),
          this.translateIndices(k, N + 1, i),
          this.translateIndices(k, N + 1, i + 1),
          kidx === 0
        );

        this.addFace(
          this.translateIndices(k, i + N + 1, N),
          this.translateIndices(k, i + N + 2, N + 1),
          this.translateIndices(k, i + N + 1, N + 1),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(k, i + N + 1, N),
          this.translateIndices(k, i + N + 2, N),
          this.translateIndices(k, i + N + 2, N + 1),
          kidx === 0
        );

        this.addFace(
          this.translateIndices(k, N, i + N + 1),
          this.translateIndices(k, N + 1, i + N + 2),
          this.translateIndices(k, N, i + N + 2),
          kidx === 0
        );
        this.addFace(
          this.translateIndices(k, N, i + N + 1),
          this.translateIndices(k, N + 1, i + N + 1),
          this.translateIndices(k, N + 1, i + N + 2),
          kidx === 0
        );
      }
      // central
      this.addFace(
        this.translateIndices(k, N, N),
        this.translateIndices(k, N + 1, N + 1),
        this.translateIndices(k, N, N + 1),
        kidx === 0
      );
      this.addFace(
        this.translateIndices(k, N, N),
        this.translateIndices(k, N + 1, N),
        this.translateIndices(k, N + 1, N + 1),
        kidx === 0
      );
    }
  }

  addVertex(i: number, j: number, k: number, pos: Vector3, basePos: Vector3) {
    let pidx = k * this.m_nEdge * this.m_nEdge + j * this.m_nEdge + i;
    if (this.m_index_to_verts[pidx] < 0) {
      this.m_index_to_verts[pidx] = this.vertices.length;

      let dir = pos.subtract(basePos);
      if (dir.length() > 0.0) {
        dir.normalize();
        this.vertices.push(
          basePos.add(dir.multiplyByFloats(this.m_radius, this.m_radius, this.m_radius))
        );
        this.normals.push(dir);
      } else this.vertices.push(pos);
      this.normals.push(pos.normalize());
    }
  }

  translateIndices(i: number, j: number, k: number) {
    let pidx = k * this.m_nEdge * this.m_nEdge + j * this.m_nEdge + i;
    return this.m_index_to_verts[pidx];
  }

  addFace(i: number, j: number, k: number, inversed: boolean) {
    if (inversed) this.indices.push(new Vector3(i, k, j));
    else this.indices.push(new Vector3(i, j, k));
  }

  toMesh(name: string) {
    let mesh = new Mesh(name);
    let vertexData = new VertexData();

    vertexData.positions = [];
    this.vertices.forEach((vertex) => {
      // @ts-ignore
      vertexData.positions.push(vertex.x, vertex.y, vertex.z);
    });
    vertexData.indices = [];
    this.indices.forEach((indice) => {
      // @ts-ignore
      vertexData.indices.push(indice.x, indice.z, indice.y);
    });
    this.normals.forEach((normal) => {
      // @ts-ignore
      // vertexData.normals.push(normal.x, normal.z, normal.y);
    });
    vertexData.applyToMesh(mesh);
    mesh.createNormals(true);
    return mesh;
  }
}
