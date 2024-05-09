/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export interface Node<T> {
  id: string | number;
  data: T;
}

export enum EdgeType {
  Combines = 1,
  Suppresses,
  IsSuppressed,
}

export class Graph<T> {
  private _nodes: { [key: string]: Node<T> } = {};
  private _edges: { [key: string]: EdgeType } = {};

  private _edgeId(nodeId1: string, nodeId2: string) {
    return `${nodeId1}->${nodeId2}`;
  }

  addNode(node: Node<T>) {
    if (!this._nodes[node.id.toString()]) {
      this._nodes[node.id.toString()] = node;
    }
    return this;
  }

  getNodeById(id: string | number): Node<T> | null {
    return this._nodes[id.toString()] || null;
  }

  addBiEdge(node1: Node<T>, node2: Node<T>, type: EdgeType) {
    this.addEdge(node1, node2, type);
    this.addEdge(node2, node1, type);
    return this;
  }

  addEdge(node1: Node<T>, node2: Node<T>, type: EdgeType) {
    this._edges[this._edgeId(node1.id.toString(), node2.id.toString())] = type;
    return this;
  }

  edgeExists(node1: Node<T>, node2: Node<T>): boolean {
    return undefined !== this._edges[this._edgeId(node1.id.toString(), node2.id.toString())];
  }

  // Algorithms

  private _isClique(nodeList: Node<T>[]) {
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        if (
          !this.edgeExists(nodeList[i], nodeList[j]) ||
          !this.edgeExists(nodeList[j], nodeList[i])
        ) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Add new node to list checking if node can be added,
   * if there are any nodes to be excluded after current node is added.
   */
  tryAddAllowedNode(nodeList: Node<T>[], node: Node<T>) {
    const newNodeList = [node].concat(nodeList);
    if (!this._isClique(newNodeList)) {
      throw new Error('Node list is not a valid clique of this graph after addition of new node');
    }

    // remove suppressed nodes
    const nodesToRemove = [];
    for (let i = 0; i < newNodeList.length; i++) {
      for (let j = i + 1; j < newNodeList.length; j++) {
        switch (
          this._edges[this._edgeId(newNodeList[i].id.toString(), newNodeList[j].id.toString())]
        ) {
          case EdgeType.Suppresses:
            nodesToRemove.push(newNodeList[j]);
            break;
          case EdgeType.IsSuppressed:
            nodesToRemove.push(newNodeList[i]);
            break;
          case EdgeType.Combines:
          default:
        }
      }
    }

    if (nodesToRemove.length === 0) {
      return newNodeList;
    }

    const finalNodeList = [];
    for (const newNode of newNodeList) {
      if (!nodesToRemove.includes(newNode)) {
        finalNodeList.push(newNode);
      }
    }

    return finalNodeList;
  }

  /**
   * Get list of nodes that make clique with current node list.
   * "Allowed" nodes are not required to make clique with each other - that should be checked separately.
   */
  public getAllowedNodes(nodeList: Node<T>[]) {
    // 1) Check that node list is clique
    if (!this._isClique(nodeList)) {
      throw new Error('Node list is not a valid clique of this graph');
    }

    // 2) Make list of nodes to check
    const nodesToCheck: Node<T>[] = [];
    const nodeListById: { [key: string]: Node<T> } = {};
    for (const node of nodeList) {
      nodeListById[node.id.toString()] = node;
    }
    for (const node in this._nodes) {
      if (!nodeListById[this._nodes[node].id.toString()]) {
        nodesToCheck.push(this._nodes[node]);
      }
    }

    // 3) Get all nodes that are connected to all nodes from list
    const allowedNodes = nodesToCheck.filter((node) => this._isClique([node].concat(nodeList)));

    // 4) Remove nodes suppressed by nodes from list
    return allowedNodes.filter((n1) => {
      for (const n2 of nodeList) {
        if (this._edges[this._edgeId(n2.id.toString(), n1.id.toString())] === EdgeType.Suppresses) {
          return false;
        }
      }
      return true;
    });
  }
}
