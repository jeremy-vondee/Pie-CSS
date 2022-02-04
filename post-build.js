const fs = require("fs");
const path = require("path");
const glob = require("glob");

const getDirectoryPaths = (root) => {
  return glob.sync(path.join(root, "/**/"));
};

const runPostBuild = (rootPath, options) => {
  const appliedOptions = {
    rootFile: {
      name: "index",
      expanded: { ext: ".css" },
      compressed: { prefix: ".min" },
    },
    subDirFile: {
      name: "index",
      expanded: { ext: ".css" },
      compressed: { prefix: ".min" },
    },
    rootDirPostBuildOrder: [{ folder: "components", sendTo: "top" }],
    subDirPostBuildOrder: [
      { folder: "animations", matchFiles: /^animation-/i, sendTo: "bottom" },
    ],
    ...options,
  };

  const {
    rootFile,
    subDirFile,
    rootDirPostBuildOrder,
    subDirPostBuildOrder,
  } = appliedOptions;

  if (fs.existsSync(rootPath)) {
    const pathStats = fs.statSync(rootPath);
    if (pathStats.isDirectory()) {
      // Get all sub directories
      const subDirPaths = getDirectoryPaths(rootPath);

      subDirPaths.forEach((dirPath) => {
        const subDirFilesList = glob.sync(
          path.join(dirPath, `/**/*${subDirFile.expanded.ext}`)
        );

        if (subDirFilesList.length !== 0) {
          const {
            expandedTop,
            expandedBottom,
            compressedTop,
            compressedBottom,
          } = subDirFilesList.reduce(
            (allContent, filePath) => {
              const fileContents = fs.readFileSync(filePath);

              if (!filePath.includes(subDirFile.name)) {
                if (
                  Array.isArray(subDirPostBuildOrder) &&
                  subDirPostBuildOrder.length > 0
                ) {
                  subDirPostBuildOrder.forEach((order) => {
                    if (filePath.includes(order.folder)) {
                      if (order.sendTo === "top") {
                        if (
                          order.matchFiles === "*" ||
                          order.matchFiles.test(path.parse(filePath).name) ||
                          order.matchFiles === undefined
                        ) {
                          if (filePath.includes(".min.css")) {
                            allContent.compressedTop += fileContents;
                          } else {
                            allContent.expandedTop += fileContents;
                          }
                        } else {
                          if (filePath.includes(".min.css")) {
                            allContent.compressedBottom += fileContents;
                          } else {
                            allContent.expandedBottom += fileContents;
                          }
                        }
                      } else if (order.sendTo === "bottom") {
                        if (
                          order.matchFiles === "*" ||
                          order.matchFiles.test(path.parse(filePath).name) ||
                          order.matchFiles === undefined
                        ) {
                          if (filePath.includes(".min.css")) {
                            allContent.compressedBottom += fileContents;
                          } else {
                            allContent.expandedBottom += fileContents;
                          }
                        } else {
                          if (filePath.includes(".min.css")) {
                            allContent.compressedTop += fileContents;
                          } else {
                            allContent.expandedTop += fileContents;
                          }
                        }
                      }
                    } else {
                      if (filePath.includes(".min.css")) {
                        allContent.compressedBottom += fileContents;
                      } else {
                        allContent.expandedBottom += fileContents;
                      }
                    }
                  });
                } else {
                  if (filePath.includes(".min.css")) {
                    allContent.compressedBottom += fileContents;
                  } else {
                    allContent.expandedBottom += fileContents;
                  }
                }
              }

              return allContent;
            },
            {
              expandedTop: "",
              expandedBottom: "",
              compressedTop: "",
              compressedBottom: "",
            }
          );

          const expanded = expandedTop + expandedBottom;
          const compressed = compressedTop + compressedBottom;
          fs.writeFileSync(
            path.join(dirPath, subDirFile.name + subDirFile.expanded.ext),
            expanded
          );
          fs.writeFileSync(
            path.join(
              dirPath,
              subDirFile.name +
                subDirFile.compressed.prefix +
                subDirFile.expanded.ext
            ),
            compressed
          );
        }
      });

      const mainFilePaths = glob.sync(
        path.join(
          rootPath,
          `*/${subDirFile.name}.{${subDirFile.expanded.ext.replace(".", "")},${
            subDirFile.compressed.prefix.replace(".", "") +
            subDirFile.expanded.ext
          }}`
        )
      );

      const {
        expandedTop,
        expandedBottom,
        compressedTop,
        compressedBottom,
      } = mainFilePaths.reduce(
        (allContent, filePath) => {
          const fileContents = fs.readFileSync(filePath);

          if (
            Array.isArray(rootDirPostBuildOrder) &&
            rootDirPostBuildOrder.length > 0
          ) {
            rootDirPostBuildOrder.forEach((order) => {
              if (filePath.includes(order.folder)) {
                if (order.sendTo === "top") {
                  if (filePath.includes(".min.css")) {
                    allContent.compressedTop += fileContents;
                  } else {
                    allContent.expandedTop += fileContents;
                  }
                } else if (order.sendTo === "bottom") {
                  if (filePath.includes(".min.css")) {
                    allContent.compressedBottom += fileContents;
                  } else {
                    allContent.expandedBottom += fileContents;
                  }
                }
              } else {
                if (filePath.includes(".min.css")) {
                  allContent.compressedBottom += fileContents;
                } else {
                  allContent.expandedBottom += fileContents;
                }
              }
            });
          } else {
            if (!filePath.includes(subDirFile.name)) {
              if (filePath.includes(".min.css")) {
                allContent.compressedBottom += fileContents;
              } else {
                allContent.expandedBottom += fileContents;
              }
            }
          }

          return allContent;
        },
        {
          expandedTop: "",
          expandedBottom: "",
          compressedTop: "",
          compressedBottom: "",
        }
      );

      const expanded = expandedTop + expandedBottom;
      const compressed = compressedTop + compressedBottom;
      fs.writeFileSync(
        path.join(rootPath, rootFile.name + rootFile.expanded.ext),
        expanded
      );
      fs.writeFileSync(
        path.join(
          rootPath,
          rootFile.name + rootFile.compressed.prefix + rootFile.expanded.ext
        ),
        compressed
      );
    }
  }
};

module.exports = runPostBuild;
