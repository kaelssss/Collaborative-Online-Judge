import { Problem } from './models/problem.model';

export const PROBLEMS: Problem[] = [
  {
    id: 1,
    name: "Regular Expression Matching",
    desc: "Implement regular expression matching with support for '.' and '*'.",
    difficulty: "super"
  },
  {
    id: 2,
    name: "Median of Two Sorted Arrays",
    desc: "There are two sorted arrays nums1 and nums2 of size m and n respectively. \nFind the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    difficulty: "hard"
  },
  {
    id: 3,
    name: "Container With Most Water",
    desc: "Given n non-negative integers a1, a2, ..., an, where each represents a point at coordinate (i, ai). \nn vertical lines are drawn such that the two endpoints of line i is at (i, ai) and (i, 0). Find two lines, which together with x-axis forms a container, such that the container contains the most water. \nNote: You may not slant the container and n is at least 2.",
    difficulty: "medium"
  },
  {
    id: 4,
    name: "Longest Common Prefix",
    desc: "Write a function to find the longest common prefix string amongst an array of strings.",
    difficulty: "easy"
  }
];