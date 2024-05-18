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

import { EdgeType, Graph } from './graph';

expect.extend({
  toHaveSameItems(actual: any[], expected: any[]) {
    const typeOk = actual.length !== undefined && expected.length !== undefined;
    if (!typeOk) {
      return {
        pass: false,
        message: () =>
          `Expected ${actual} and ${expected} to be valid array-like objects or arrays.`,
      };
    }

    const ok =
      actual.length === expected.length &&
      expected.length ===
        expected.reduce((acc: number, item) => {
          if (actual.includes(item)) {
            return acc + 1;
          }
          return acc;
        }, 0);

    return {
      pass: ok,
      message: () => `Expected ${actual} to have same items as ${expected}`,
    };
  },
});

describe('Graph module', () => {
  it('should create the graph', () => {
    const graph = new Graph<number>();
    expect(graph).toBeTruthy();
  });

  it('should add nodes to graph', () => {
    const graph = new Graph<number>();
    graph.addNode({ id: 'foo', data: 123 });
    graph.addNode({ id: 'bar', data: 321 });

    const node = graph.getNodeById('foo');
    expect(node).toBeTruthy();
    expect(node).toEqual({ id: 'foo', data: 123 });
  });

  it('should add edges to graph', () => {
    const graph = new Graph<number>();

    const node1 = { id: 'foo', data: 123 };
    const node2 = { id: 'bar', data: 321 };

    graph.addNode(node1).addNode(node2);
    graph.addBiEdge(node1, node2, EdgeType.Combines);
    expect(graph.edgeExists(node1, node2)).toBeTruthy();
  });

  it('should find allowed edges with combined edge type', () => {
    const graph = new Graph<number>();

    const nodes = [
      { id: 'node1', data: 1 },
      { id: 'node2', data: 2 },
      { id: 'node3', data: 3 },
      { id: 'node4', data: 4 },
      { id: 'node5', data: 5 },
    ];

    nodes.forEach((node) => graph.addNode(node));

    // 1-2-3 clique
    graph.addBiEdge(nodes[0], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[1], nodes[2], EdgeType.Combines);
    graph.addBiEdge(nodes[2], nodes[0], EdgeType.Combines);
    // non-clique edges
    graph.addBiEdge(nodes[3], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[4], nodes[3], EdgeType.Combines);

    expect(graph.getAllowedNodes([nodes[0], nodes[1]])).toHaveSameItems([nodes[2]]);
    expect(graph.getAllowedNodes([nodes[1]])).toHaveSameItems([nodes[0], nodes[2], nodes[3]]);
    expect(graph.getAllowedNodes([nodes[4]])).toHaveSameItems([nodes[3]]);
  });

  it('should find allowed edges with suppressing edge type', () => {
    const graph = new Graph<number>();

    const nodes = [
      { id: 'node0', data: 0 },
      { id: 'node1', data: 1 },
      { id: 'node2', data: 2 },
      { id: 'node3', data: 3 },
      { id: 'node4', data: 4 },
    ];

    nodes.forEach((node) => graph.addNode(node));

    // 1-2-3 clique
    graph.addBiEdge(nodes[0], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[1], nodes[2], EdgeType.Combines);
    graph.addBiEdge(nodes[2], nodes[0], EdgeType.Combines);
    // non-clique edges, all connected to [1]; [4] suppresses [3]
    graph.addBiEdge(nodes[3], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[4], nodes[1], EdgeType.Combines);
    graph.addEdge(nodes[3], nodes[4], EdgeType.IsSuppressed);
    graph.addEdge(nodes[4], nodes[3], EdgeType.Suppresses);

    // clique nodes
    expect(graph.getAllowedNodes([nodes[0], nodes[1]])).toHaveSameItems([nodes[2]]);

    // try to reach suppressed/suppressing nodes
    expect(graph.getAllowedNodes([nodes[1]])).toHaveSameItems([
      nodes[0],
      nodes[2],
      nodes[3],
      nodes[4],
    ]);

    // if [4] is in list, [3] should not be in allowed list
    expect(graph.getAllowedNodes([nodes[1], nodes[4]])).toEqual([]);
  });

  it('should add allowed nodes with combined edge type', () => {
    const graph = new Graph<number>();

    const nodes = [
      { id: 'node1', data: 1 },
      { id: 'node2', data: 2 },
      { id: 'node3', data: 3 },
      { id: 'node4', data: 4 },
      { id: 'node5', data: 5 },
    ];

    nodes.forEach((node) => graph.addNode(node));

    // 1-2-3 clique
    graph.addBiEdge(nodes[0], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[1], nodes[2], EdgeType.Combines);
    graph.addBiEdge(nodes[2], nodes[0], EdgeType.Combines);
    // non-clique edges
    graph.addBiEdge(nodes[3], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[4], nodes[3], EdgeType.Combines);

    expect(graph.tryAddAllowedNode([nodes[0], nodes[1]], nodes[2])).toHaveSameItems([
      nodes[0],
      nodes[1],
      nodes[2],
    ]);
  });

  it('should add allowed nodes with suppressing edge type', () => {
    const graph = new Graph<number>();

    const nodes = [
      { id: 'node1', data: 1 },
      { id: 'node2', data: 2 },
      { id: 'node3', data: 3 },
    ];

    nodes.forEach((node) => graph.addNode(node));

    // 1-2-3 semi-clique
    graph.addBiEdge(nodes[0], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[1], nodes[2], EdgeType.Combines);
    graph.addEdge(nodes[2], nodes[0], EdgeType.Suppresses);
    graph.addEdge(nodes[0], nodes[2], EdgeType.IsSuppressed);

    expect(graph.tryAddAllowedNode([nodes[0], nodes[1]], nodes[2])).toHaveSameItems([
      nodes[1],
      nodes[2],
    ]);
  });

  it('should not add allowed nodes with suppressed edge type', () => {
    const graph = new Graph<number>();

    const nodes = [
      { id: 'node1', data: 1 },
      { id: 'node2', data: 2 },
      { id: 'node3', data: 3 },
    ];

    nodes.forEach((node) => graph.addNode(node));

    // 1-2-3 semi-clique
    graph.addBiEdge(nodes[0], nodes[1], EdgeType.Combines);
    graph.addBiEdge(nodes[1], nodes[2], EdgeType.Combines);
    graph.addEdge(nodes[0], nodes[2], EdgeType.Suppresses);
    graph.addEdge(nodes[2], nodes[0], EdgeType.IsSuppressed);

    expect(graph.tryAddAllowedNode([nodes[0], nodes[1]], nodes[2])).toHaveSameItems([
      nodes[0],
      nodes[1],
    ]);
  });
});
