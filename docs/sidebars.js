/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'intro',
        'installation',
        'architecture',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core-concepts/diamond-standard',
        'core-concepts/submissions',
        'core-concepts/evaluation',
        'core-concepts/tokenomics',
      ],
    },
    {
      type: 'category',
      label: 'Smart Contracts',
      items: [
        'smart-contracts/overview',
        'smart-contracts/diamond',
        'smart-contracts/submission-facet',
        'smart-contracts/evaluation-facet',
        'smart-contracts/token-facet',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/javascript-sdk',
        'api/rest-api',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/creating-submissions',
        'guides/evaluating-content',
        'guides/upgrading-contracts',
      ],
    },
    'faq',
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

module.exports = sidebars; 