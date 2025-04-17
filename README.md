nvm install 22
nvm use 22
npm create vite@latest afrovalleyui -- --template react
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

 <button
                              disabled={favoriteLoading[listing.id]}
                              className="cursor-pointer"
                            >
                              {favoriteLoading[listing.id] ? (
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                              ) : (
                                <Heart
                                  className={`h-5 w-5 transition-colors duration-150 ${
                                    isFavorited
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-400"
                                  }`}
                                  fill={isFavorited ? "currentColor" : "none"}
                                />
                              )}
                            </button>
