class TrieNode {
  constructor() {
    this.children = {};
    this.isCompleteWord = false;
    this.word = null;
  }
}

export class TrieTree {
  constructor() {
    this.tireRoot = new TrieNode();
  }

  insert = (word, alternateWord) => {
    let node = this.tireRoot;
    for (let i = 0; i < word.length; i++) {
      let letter = word[i];
      if (!(letter in node.children)) {
        node.children[letter] = new TrieNode();
      }
      node = node.children[letter];
    }
    node.isCompleteWord = true;
    if (alternateWord) {
      node.word = alternateWord;
    } else {
      node.word = word;
    }
  };

  search = (word) => {
    let node = this.tireRoot;
    for (let i = 0; i < word.length; i++) {
      let letter = word[i];
      if (!(letter in node.children)) {
        return [];
      }
      node = node.children[letter];
    }
    // now based off that node, do a dfs and then get all the complete word.
    let result = [];

    const dfs = (node) => {
      if (!node) {
        return;
      }

      let { isCompleteWord, word } = node;

      if (isCompleteWord) {
        result.push(word);
      }

      // get the children
      let children = Object.keys(node.children);
      children.forEach((child) => {
        dfs(node.children[child]);
      });
    };

    dfs(node);
    return result;
  };
}
