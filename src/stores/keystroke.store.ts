import { extractMeetingLink } from "lib/calendar";
import { solNative } from "lib/SolNative";
import { makeAutoObservable } from "mobx";
import { Clipboard, type EmitterSubscription, Linking } from "react-native";
import type { IRootStore } from "store";
import { ItemType, Widget } from "./ui.store";
import { EMOJI_ROW_SIZE } from "./emoji.store";
import { isValidCustomSearchEngineUrl } from "widgets/settings/general";

let keyDownListener: EmitterSubscription | undefined;
let keyUpListener: EmitterSubscription | undefined;

export type KeystrokeStore = ReturnType<typeof createKeystrokeStore>;

export const createKeystrokeStore = (root: IRootStore) => {
	const store = makeAutoObservable({
		commandPressed: false,
		shiftPressed: false,
		controlPressed: false,

		simulateEnter: () => {
			store.keyDown({ keyCode: 36, meta: false, shift: false });
		},
		keyDown: async ({
			keyCode,
			meta,
			shift,
		}: {
			keyCode: number;
			meta: boolean;
			shift: boolean;
		}) => {
			switch (keyCode) {
				// "j" key
				case 38: {
					// simulate a down key press
					if (store.controlPressed) {
						store.keyDown({ keyCode: 125, meta: false, shift: false });
					}
					break;
				}
				// "k" key
				case 40: {
					if (store.controlPressed) {
						store.keyDown({ keyCode: 126, meta: false, shift: false });
					}
					break;
				}
				// delete key
				case 51: {
					if (
						store.shiftPressed &&
						root.ui.focusedWidget === Widget.SEARCH &&
						root.ui.currentItem != null &&
						root.ui.currentItem.type === ItemType.CUSTOM
					) {
						root.ui.deleteCustomItem(root.ui.currentItem.id);
						return;
					}

					if (root.ui.focusedWidget === Widget.CLIPBOARD) {
						if (shift) {
							root.clipboard.deleteItem(root.ui.selectedIndex);
						}
						return;
					}
					break;
				}
				// "e" key
				case 14: {
					if (
						meta &&
						root.ui.focusedWidget === Widget.SEARCH &&
						root.ui.currentItem != null &&
						root.ui.currentItem.type === ItemType.CUSTOM
					) {
						root.ui.setEditingCustomItem(root.ui.currentItem);
						root.ui.focusWidget(Widget.CREATE_ITEM);
					}
					break;
				}
				// tab key
				case 48: {
					switch (root.ui.focusedWidget) {
						//   case Widget.SEARCH:
						//     if (!!root.calendar.filteredEvents.length) {
						//       root.ui.selectedIndex = 0
						//       root.ui.focusedWidget = Widget.CALENDAR
						//     }
						//     break

						//   case Widget.CALENDAR:
						//     root.ui.selectedIndex = 0
						//     root.ui.focusedWidget = Widget.SEARCH
						//     break
						case Widget.SCRATCHPAD:
							root.ui.rotateScratchPadColor();
					}

					break;
				}

				// enter key
				case 36: {
					if (root.ui.confirmDialogShown) {
						root.ui.executeConfirmCallback();
						return;
					}

					root.ui.setHistoryPointer(0);
					switch (root.ui.focusedWidget) {
						case Widget.FILE_SEARCH: {
							const file = root.ui.files[root.ui.selectedIndex];
							if (file?.url) {
								if (shift) {
									const filePath = file.url;
									const directoryPath = filePath.substring(
										0,
										filePath.lastIndexOf("/"),
									);
									solNative.openFinderAt(directoryPath);
								} else {
									solNative.openFile(file.url);
									solNative.hideWindow();
								}
							}
							break;
						}

						case Widget.PROCESSES: {
							const process =
								root.processes.filteredProcesses[root.ui.selectedIndex];
							if (process) {
								solNative.killProcess(process.id.toString());
							}
							solNative.hideWindow();
							solNative.showToast(
								`Process "${process.processName}" killed`,
								"success",
							);
							break;
						}
						case Widget.CLIPBOARD: {
							if (root.clipboard.clipboardItems.length === 0) {
								return;
							}

							const entry =
								root.clipboard.clipboardItems[root.ui.selectedIndex];

							const originalIndex = root.clipboard.clipboardItems.findIndex(
								(e) => entry === e,
							);

							root.clipboard.popToTop(originalIndex);

							if (entry) {
								if (meta) {
									try {
										Linking.openURL(entry.text);
									} catch (e) {
										// console.log('could not open in browser')
									}
									solNative.hideWindow();
								} else {
									solNative.pasteToFrontmostApp(entry.text);
								}
							}

							break;
						}

						case Widget.EMOJIS: {
							root.emoji.insert(root.ui.selectedIndex);
							break;
						}

						// Enter listener is disabled while using the scratch pad
						case Widget.SCRATCHPAD: {
							break;
						}

						case Widget.ONBOARDING: {
							switch (root.ui.onboardingStep) {
								case "v1_start": {
									root.ui.onboardingStep = "v1_shortcut";
									break;
								}

								case "v1_shortcut": {
									if (shift) {
										root.ui.openKeyboardSettings();
										return;
									}

									root.ui.onboardingStep = "v1_quick_actions";
									break;
								}

								case "v1_quick_actions": {
									root.ui.onboardingStep = "v1_completed";
									break;
								}
							}
							break;
						}

						case Widget.CALENDAR: {
							const event = root.calendar.filteredEvents[root.ui.selectedIndex];
							if (event) {
								let eventLink: string | null | undefined = event.url;

								if (!eventLink) {
									eventLink = extractMeetingLink(event.notes, event.location);
								}

								if (eventLink) {
									Linking.openURL(eventLink);
								} else {
									Linking.openURL("ical://");
								}
							} else {
								Linking.openURL("ical://");
							}
							solNative.hideWindow();
							break;
						}

						case Widget.TRANSLATION: {
							if (root.ui.translationResults) {
								Clipboard.setString(
									root.ui.translationResults[root.ui.selectedIndex],
								);
								solNative.hideWindow();
								root.ui.translationResults = [];
							}
							break;
						}

						case Widget.SEARCH: {
							if (
								!root.ui.query &&
								root.ui.calendarAuthorizationStatus === "notDetermined"
							) {
								solNative
									.requestCalendarAccess()
									.then(() => {
										root.ui.getCalendarAccess();
									})
									.catch((e) => {
										root.ui.getCalendarAccess();
									});
								solNative.hideWindow();
								return;
							}

							if (!root.ui.query && !root.ui.isAccessibilityTrusted) {
								solNative.requestAccessibilityAccess();
								solNative.hideWindow();
								return;
							}

							if (!root.ui.query) {
								if (!root.ui.hasDismissedGettingStarted) {
									Linking.openURL(
										"https://sol.ospfranco.com/getting_started",
									).catch((e) => {
										solNative.showToast(
											`Could not open URL: https://sol.ospfranco.com/getting_started, error: ${e}`,
											"error",
										);
									});
									solNative.hideWindow();
									root.ui.setHasDismissedGettingStarted(true);
									return;
								}

								if (
									!!root.calendar.upcomingEvent &&
									root.calendar.upcomingEvent.eventStatus !== 3
								) {
									if (root.calendar.upcomingEvent.eventLink) {
										Linking.openURL(root.calendar.upcomingEvent.eventLink);
									} else {
										Linking.openURL("ical://");
									}

									return;
								}

								return;
							}

							//    ____  _    _ ______ _______     __  ______ _   _ _______ ______ _____  ______ _____
							//   / __ \| |  | |  ____|  __ \ \   / / |  ____| \ | |__   __|  ____|  __ \|  ____|  __ \
							//  | |  | | |  | | |__  | |__) \ \_/ /  | |__  |  \| |  | |  | |__  | |__) | |__  | |  | |
							//  | |  | | |  | |  __| |  _  / \   /   |  __| | . ` |  | |  |  __| |  _  /|  __| | |  | |
							//  | |__| | |__| | |____| | \ \  | |    | |____| |\  |  | |  | |____| | \ \| |____| |__| |
							//   \___\_\\____/|______|_|  \_\ |_|    |______|_| \_|  |_|  |______|_|  \_\______|_____/

							root.ui.addToHistory(root.ui.query);

							if (shift) {
								root.ui.translateQuery();
								return;
							}

							// If there are no items, or if the query is a meta (⌘ is pressed) query, open a google search
							if (!root.ui.items.length || meta) {
								switch (root.ui.searchEngine) {
									case "google":
										Linking.openURL(
											`https://google.com/search?q=${encodeURI(root.ui.query)}`,
										).catch((e) => {
											solNative.showToast(
												`Could not open URL: ${root.ui.query}, error: ${e}`,
												"error",
											);
										});
										break;
									case "duckduckgo":
										Linking.openURL(
											`https://duckduckgo.com/?q=${encodeURI(root.ui.query)}`,
										).catch((e) => {
											solNative.showToast(
												`Could not open URL: ${root.ui.query}, error: ${e}`,
												"error",
											);
										});
										break;
									case "bing":
										Linking.openURL(
											`https://bing.com/search?q=${encodeURI(root.ui.query)}`,
										).catch((e) => {
											solNative.showToast(
												`Could not open URL: ${root.ui.query}, error: ${e}`,
												"error",
											);
										});
										break;
									case "perplexity":
										Linking.openURL(
											`https://perplexity.ai/search/new?q=${encodeURI(
												root.ui.query,
											)}`,
										).catch((e) => {
											solNative.showToast(
												`Could not open URL: ${root.ui.query}, error: ${e}`,
												"error",
											);
										});
										break;
									case "custom":
										if (
											!isValidCustomSearchEngineUrl(root.ui.customSearchUrl)
										) {
											solNative.showToast(
												`Invalid search URL. Please ensure the URL is a valid search engine URL and includes a query parameter. Example: https://google.com/search?q=%s`,
												"error",
											);
											break;
										}
										Linking.openURL(
											root.ui.customSearchUrl.replace(
												"%s",
												encodeURI(root.ui.query),
											),
										).catch((e) => {
											solNative.showToast(
												`Could not open URL: ${root.ui.query}, error: ${e}`,
												"error",
											);
										});
										break;
								}

								solNative.hideWindow();
								return;
							}

							const item = root.ui.items[root.ui.selectedIndex];

							if (item == null) {
								return;
							}

							if (
								item.type === ItemType.TEMPORARY_RESULT &&
								root.ui.temporaryResult
							) {
								Clipboard.setString(root.ui.temporaryResult);
								solNative.showToast("Copied to clipboard", "success");
								solNative.hideWindow();
								return;
							}

							// bump frequency
							root.ui.frequencies[item.name] =
								(root.ui.frequencies[item.name] ?? 0) + 1;

							// close window
							if (!item.preventClose) {
								solNative.hideWindow();
							}

							if (store.commandPressed && item.metaCallback) {
								item.metaCallback();
								return;
							}

							if (item.callback) {
								item.callback();
								return;
							}

							if (item.url) {
								solNative.openFile(item.url);
								return;
							}

							if (item.type === ItemType.CUSTOM) {
								if (!item.text) {
									return;
								}

								if (item.isApplescript) {
									solNative.executeAppleScript(item.text);
								} else {
									try {
										const canOpenURL = await Linking.canOpenURL(item.text);
										if (canOpenURL) {
											await Linking.openURL(item.text);
										} else {
											solNative.showToast(
												`Could not open URL: ${item.text}`,
												"error",
											);
										}
									} catch (e) {
										solNative.showToast(
											`Could not open URL: ${item.text}`,
											"error",
										);
									}
								}
							}

							break;
						}
					}
					break;
				}

				// esc key
				case 53: {
					if (root.ui.confirmDialogShown) {
						root.ui.closeConfirm();
						return;
					}

					switch (root.ui.focusedWidget) {
						case Widget.SEARCH:
						case Widget.EMOJIS:
						case Widget.SCRATCHPAD:
						case Widget.CLIPBOARD:
						case Widget.GOOGLE_MAP:
							solNative.hideWindow();
							break;

						default:
							root.ui.setQuery("");
							break;
					}

					root.ui.focusWidget(Widget.SEARCH);
					break;
				}

				// left key
				case 123: {
					switch (root.ui.focusedWidget) {
						case Widget.TRANSLATION: {
							root.ui.selectedIndex = Math.max(0, root.ui.selectedIndex - 1);
							break;
						}

						case Widget.CALENDAR:
							// const selectedEvent =
							//   root.calendar.filteredEvents[root.ui.selectedIndex]
							// let groupIndex = -1
							// let itemIndex = -1
							// let groups = root.calendar.groupedEvents
							// for (let ii = 0; ii < groups.length; ii++) {
							//   const group = groups[ii]
							//   for (let jj = 0; jj < group.data.length; jj++) {
							//     const event = group.data[jj]
							//     if (event.id === selectedEvent.id) {
							//       itemIndex = jj
							//       groupIndex = ii
							//     }
							//   }
							// }

							// if (groupIndex === -1 || itemIndex === -1) {
							//   throw new Error('Could not find Item something is wrong')
							// }

							// let nextGroupIndex = groupIndex - 1

							// while (
							//   nextGroupIndex >= 0 &&
							//   !groups[nextGroupIndex].data.length
							// ) {
							//   nextGroupIndex--
							// }

							// if (nextGroupIndex === -1) {
							//   return
							// }

							// itemIndex = Math.min(
							//   groups[nextGroupIndex].data.length - 1,
							//   itemIndex,
							// )

							// if (itemIndex === -1) {
							//   return
							// }

							// const nextEvent = groups[nextGroupIndex].data[itemIndex]
							// const nextIndex = root.calendar.filteredEvents.findIndex(
							//   e => e.id === nextEvent.id,
							// )

							// root.ui.selectedIndex = nextIndex

							break;

						case Widget.EMOJIS: {
							if (root.emoji.emojis.length === 0) {
								return;
							}

							const totalSize =
								(root.emoji.emojis.length - 1) * EMOJI_ROW_SIZE +
								root.emoji.emojis[root.emoji.emojis.length - 1].length;

							if (root.ui.selectedIndex === 0) {
								if (root.emoji.emojis.length > EMOJI_ROW_SIZE - 1) {
									root.ui.selectedIndex = EMOJI_ROW_SIZE - 1;
								} else {
									root.ui.selectedIndex = totalSize - 1;
								}
							} else {
								root.ui.selectedIndex = root.ui.selectedIndex - 1;
							}

							break;
						}
					}
					break;
				}

				// right key
				case 124: {
					switch (root.ui.focusedWidget) {
						case Widget.TRANSLATION: {
							const modulo = root.ui.thirdTranslationLanguage !== null ? 3 : 2;
							root.ui.selectedIndex = (root.ui.selectedIndex + 1) % modulo;
							break;
						}

						case Widget.CALENDAR: {
							const selectedEvent =
								root.calendar.filteredEvents[root.ui.selectedIndex];
							let groupIndex = -1;
							let itemIndex = -1;
							const groups = Object.values(root.calendar.groupedEvents);
							for (let ii = 0; ii < groups.length; ii++) {
								const group = groups[ii];
								for (let jj = 0; jj < group.data.length; jj++) {
									const event = group.data[jj];
									if (event.id === selectedEvent.id) {
										itemIndex = jj;
										groupIndex = ii;
									}
								}
							}

							if (groupIndex === -1 || itemIndex === -1) {
								throw new Error("Could not find event something is wrong");
							}

							let nextGroupIndex = groupIndex + 1;

							while (
								nextGroupIndex < groups.length &&
								!groups[nextGroupIndex].data.length
							) {
								nextGroupIndex++;
							}

							if (nextGroupIndex === groups.length) {
								return;
							}

							itemIndex = Math.min(
								groups[nextGroupIndex].data.length - 1,
								itemIndex,
							);

							if (itemIndex === -1) {
								return;
							}

							const nextEvent = groups[nextGroupIndex].data[itemIndex];
							const nextIndex = root.calendar.filteredEvents.findIndex(
								(e) => e.id === nextEvent.id,
							);

							root.ui.selectedIndex = nextIndex;

							break;
						}

						case Widget.EMOJIS: {
							if (root.emoji.emojis.length === 0) {
								return;
							}

							const totalSize =
								(root.emoji.emojis.length - 1) * EMOJI_ROW_SIZE +
								root.emoji.emojis[root.emoji.emojis.length - 1].length;

							if (root.ui.selectedIndex + 1 === totalSize) {
								root.ui.selectedIndex = 0;
							} else {
								root.ui.selectedIndex += 1;
							}
							break;
						}
					}
					break;
				}

				// up key
				case 126: {
					switch (root.ui.focusedWidget) {
						case Widget.SCRATCHPAD:
							break;

						case Widget.EMOJIS:
							root.ui.selectedIndex = Math.max(
								root.ui.selectedIndex - EMOJI_ROW_SIZE,
								0,
							);
							break;

						case Widget.ONBOARDING:
							root.ui.selectedIndex = Math.max(0, root.ui.selectedIndex - 1);

							if (root.ui.selectedIndex === 0) {
								root.ui.setGlobalShortcut("option");
							} else if (root.ui.selectedIndex === 1) {
								root.ui.setGlobalShortcut("control");
							} else {
								root.ui.setGlobalShortcut("command");
							}
							break;

						default:
							if (
								root.ui.focusedWidget === Widget.SEARCH &&
								root.ui.selectedIndex === 0 &&
								root.ui.history.length > 0
							) {
								root.ui.setQuery(
									root.ui.history[
										root.ui.history.length - 1 - root.ui.historyPointer
									],
								);

								root.ui.setHistoryPointer(
									Math.min(root.ui.history.length, root.ui.historyPointer + 1),
								);
								return;
							}

							root.ui.selectedIndex = Math.max(0, root.ui.selectedIndex - 1);
							break;
					}
					break;
				}

				// down key
				case 125: {
					switch (root.ui.focusedWidget) {
						case Widget.CLIPBOARD: {
							root.ui.selectedIndex = Math.min(
								root.ui.selectedIndex + 1,
								root.clipboard.items.length - 1,
							);
							break;
						}

						case Widget.ONBOARDING:
							root.ui.selectedIndex = Math.min(2, root.ui.selectedIndex + 1);

							if (root.ui.selectedIndex === 0) {
								root.ui.setGlobalShortcut("option");
							} else if (root.ui.selectedIndex === 1) {
								root.ui.setGlobalShortcut("control");
							} else {
								root.ui.setGlobalShortcut("command");
							}
							break;

						case Widget.EMOJIS: {
							const rowIndex = Math.floor(
								root.ui.selectedIndex / EMOJI_ROW_SIZE,
							);
							const columnIndex = root.ui.selectedIndex % EMOJI_ROW_SIZE;

							if (
								rowIndex + 1 < root.emoji.emojis.length &&
								columnIndex < root.emoji.emojis[rowIndex + 1].length
							) {
								root.ui.selectedIndex = root.ui.selectedIndex + EMOJI_ROW_SIZE;
							} else {
								root.ui.selectedIndex = columnIndex;
							}
							break;
						}

						case Widget.SEARCH: {
							root.ui.selectedIndex = Math.min(
								root.ui.items.length - 1,
								root.ui.selectedIndex + 1,
							);
							break;
						}

						case Widget.CALENDAR: {
							root.ui.selectedIndex = Math.min(
								root.calendar.filteredEvents.length - 1,
								root.ui.selectedIndex + 1,
							);
							break;
						}

						case Widget.TRANSLATION: {
							const modulo = root.ui.thirdTranslationLanguage !== null ? 3 : 2;
							root.ui.selectedIndex = (root.ui.selectedIndex + 1) % modulo;
							break;
						}

						case Widget.PROCESSES: {
							root.ui.selectedIndex = Math.min(
								root.ui.selectedIndex + 1,
								root.processes.filteredProcesses.length - 1,
							);
							break;
						}

						case Widget.FILE_SEARCH: {
							root.ui.selectedIndex = Math.min(
								root.ui.selectedIndex + 1,
								root.ui.files.length - 1,
							);
							break;
						}
					}
					break;
				}

				// "1"
				// case 18: {
				//   if (meta) {
				//     if (root.ui.query) {
				//       Linking.openURL(`https://google.com/search?q=${root.ui.query}`)
				//       root.ui.query = ''
				//     }
				//   }
				//   break
				// }

				// // "2"
				// case 19: {
				//   if (meta) {
				//     if (root.ui.query) {
				//       root.ui.translateQuery()
				//     }
				//   }
				//   break
				// }

				// // "3"
				// case 20: {
				//   if (meta) {
				//     if (root.ui.query) {
				//       root.ui.focusedWidget = Widget.GOOGLE_MAP
				//     } else {
				//       root.ui.runFavorite(2)
				//     }
				//   }
				//   break
				// }

				// "4"
				// case 21: {
				//   if (meta) {
				//     root.ui.runFavorite(3)
				//   }
				//   break
				// }

				// // "5"
				// case 23: {
				//   if (meta) {
				//     root.ui.runFavorite(4)
				//   }
				//   break
				// }

				// meta key
				case 55: {
					store.commandPressed = true;
					break;
				}

				// shift key
				case 60: {
					store.shiftPressed = true;
					break;
				}

				// control key
				case 59: {
					store.controlPressed = true;
					break;
				}
			}
		},
		keyUp: async ({
			keyCode,
			meta,
		}: {
			key: string;
			keyCode: number;
			meta: boolean;
		}) => {
			switch (keyCode) {
				case 55:
					store.commandPressed = false;
					break;

				case 60: {
					store.shiftPressed = false;
					break;
				}

				case 59: {
					store.controlPressed = false;
					break;
				}

				default:
					break;
			}
		},
		cleanUp: () => {
			keyDownListener?.remove();
			keyUpListener?.remove();
		},
	});

	keyDownListener = solNative.addListener("keyDown", store.keyDown);
	keyUpListener = solNative.addListener("keyUp", store.keyUp);

	return store;
};
