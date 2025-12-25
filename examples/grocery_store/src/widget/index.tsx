import { useEffect, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { getImageForItem } from "./images.js";
// Import SDK to ensure window.pixie is available
import "../../../../src/index.ts";
import type { Provider } from "../../../../src/types.js";
import "./styles.css";

declare global {
  interface Window {
    pixie: Provider;
  }
}

type CartItem = {
  name: string;
  quantity: number;
  price?: number;
};

type CartWidgetState = {
  items?: CartItem[];
};

type GroceryItem = {
  name: string;
  description: string;
  price?: number;
};

type GroceryPayload = {
  items?: GroceryItem[];
};

const createDefaultCartState = (): CartWidgetState => ({
  items: [],
});

function App() {
  const toolOutput = window.pixie.useToolOutput() as GroceryPayload | null;
  const widgetState = window.pixie.getWidgetState() as CartWidgetState | null;
  
  const [cartState, setCartState] = useState<CartWidgetState>(() => {
    return widgetState ?? createDefaultCartState();
  });
  
  // Show cart if there are items when widget loads
  const [isCartVisible, setIsCartVisible] = useState(() => {
    const savedState = window.pixie.getWidgetState() as CartWidgetState | null;
    const items = Array.isArray(savedState?.items) ? savedState.items : [];
    return items.length > 0;
  });
  
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const cartItems = Array.isArray(cartState?.items) ? cartState.items : [];
  const lastToolOutputRef = useRef<string>("__tool_output_unset__");
  
  // Sync with window.pixie widgetState when it changes
  useEffect(() => {
    const currentState = window.pixie.getWidgetState() as CartWidgetState | null;
    if (currentState) {
      setCartState(currentState);
    }
  }, [widgetState]);

  // Update cart when tool output changes
  useEffect(() => {
    if (toolOutput == null) {
      return;
    }

    const serializedToolOutput = (() => {
      try {
        return JSON.stringify(toolOutput);
      } catch (error) {
        console.warn("Unable to serialize toolOutput", error);
        return "__tool_output_error__";
      }
    })();

    if (serializedToolOutput === lastToolOutputRef.current) {
      return;
    }
    lastToolOutputRef.current = serializedToolOutput;

    const incomingItems = Array.isArray(toolOutput?.items)
      ? toolOutput.items ?? []
      : [];

    const baseState = cartState ?? createDefaultCartState();
    const baseItems = Array.isArray(baseState.items) ? baseState.items : [];

    const itemsByName = new Map<string, CartItem>();
    for (const item of baseItems) {
      if (item?.name) {
        itemsByName.set(item.name, item);
      }
    }

    for (const item of incomingItems) {
      if (item?.name) {
        const existing = itemsByName.get(item.name);
        itemsByName.set(item.name, {
          name: item.name,
          quantity: existing?.quantity ?? 0,
          price: item.price ?? existing?.price,
        });
      }
    }

    const nextItems = Array.from(itemsByName.values());
    const nextState = {
      ...baseState,
      items: nextItems,
    };

    setCartState(nextState);
    window.pixie.setWidgetState(nextState);
  }, [toolOutput, cartState]);

  const addItem = useCallback((name: string, price?: number) => {
    if (!name) {
      return;
    }

    setCartState((prevState) => {
      const baseState: CartWidgetState = prevState ?? {};
      const items = Array.isArray(baseState.items)
        ? baseState.items.map((item) => ({ ...item }))
        : [];
      const idx = items.findIndex((item) => item.name === name);

      if (idx === -1) {
        items.push({ name, quantity: 1, price });
      } else {
        const current = items[idx];
        items[idx] = {
          ...current,
          quantity: (current.quantity ?? 0) + 1,
        };
      }

      const newState = { ...baseState, items };
      window.pixie.setWidgetState(newState);
      return newState;
    });
    
    // Auto-show cart when item is added
    setIsCartVisible(true);
  }, []);

  const adjustQuantity = useCallback((name: string, delta: number) => {
    if (!name || delta === 0) {
      return;
    }

    setCartState((prevState) => {
      const baseState: CartWidgetState = prevState ?? {};
      const items = Array.isArray(baseState.items)
        ? baseState.items.map((item) => ({ ...item }))
        : [];

      const idx = items.findIndex((item) => item.name === name);
      if (idx === -1) {
        return baseState;
      }

      const current = items[idx];
      const nextQuantity = Math.max(0, (current.quantity ?? 0) + delta);
      if (nextQuantity === 0) {
        items.splice(idx, 1);
      } else {
        items[idx] = { ...current, quantity: nextQuantity };
      }

      const newState = { ...baseState, items };
      window.pixie.setWidgetState(newState);
      return newState;
    });
  }, []);

  function handleItemClick(item: GroceryItem) {
    // Request fullscreen display mode
    window.pixie.requestDisplayMode("fullscreen");
  }

  function handleCheckout() {
    // Open external link
    window.pixie.openExternal("https://trypixie.app");
  }

  // Test functions for window.pixie methods
  function testSendFollowupMessage() {
    window.pixie.sendFollowupMessage("Can you show me more dairy products?");
  }

  function testOpenExternal() {
    window.pixie.openExternal("https://trypixie.app");
  }

  function testRequestModal() {
    window.pixie.requestModal({ 
      title: "Modal View", 
      params: { message: "This is a test modal!" } 
    });
  }

  function testRequestClose() {
    window.pixie.requestClose();
  }

  function testCallTool() {
    window.pixie.callTool("search-groceries", { query: "fruits" });
  }

  const groceryItems: GroceryItem[] = Array.isArray(toolOutput?.items)
    ? toolOutput.items
    : [];

  // Debug: log grocery items to console
  useEffect(() => {
    if (groceryItems.length > 0) {
      console.log('Grocery items loaded:', groceryItems.length, groceryItems);
    }
  }, [groceryItems]);

  const visibleCartItems = cartItems.filter(item => (item.quantity ?? 0) > 0);
  const totalPrice = visibleCartItems.reduce((sum, item) => {
    return sum + (item.price ?? 0) * (item.quantity ?? 0);
  }, 0);

  return (
    <div
      className="min-h-screen w-full bg-white text-black"
      style={{
        fontFamily: '"Trebuchet MS", "Gill Sans", "Lucida Grande", sans-serif',
        background: 'radial-gradient(circle at top left, #fff7ed 0%, #ffffff 55%), radial-gradient(circle at bottom right, #eef2ff 0%, #ffffff 45%)',
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8">
        <header 
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: "fadeUp 0.6s ease-out both" 
          }}
        >
          <p style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(0, 0, 0, 0.6)',
            margin: 0,
          }}>
            Fresh Groceries
          </p>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            letterSpacing: '-0.025em',
            background: 'linear-gradient(to right, #d97706, #ea580c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
          }}>
            Grocery Store
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.7)',
            margin: 0,
          }}>
            Browse fresh groceries and add them to your cart
          </p>
        </header>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
        }}>
          <section style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            flex: isCartVisible ? '2' : '1',
            minWidth: 0,
          }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(0, 0, 0, 0.7)',
                margin: 0,
              }}>
                Groceries
              </p>
              <button
                type="button"
                onClick={() => setIsCartVisible(!isCartVisible)}
                style={{
                  borderRadius: '0.75rem',
                  border: '2px solid #fef3c7',
                  background: '#fff',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#d97706',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef3c7';
                  e.currentTarget.style.borderColor = '#fcd34d';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#fef3c7';
                }}
              >
                <span>🛒</span>
                <span>{isCartVisible ? 'Hide' : 'Show'} Cart ({visibleCartItems.length})</span>
              </button>
            </header>
            {groceryItems.length > 0 ? (
              <div className="carousel-wrapper" style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
                <button
                  type="button"
                  className="carousel-button carousel-button-left"
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll left"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '10px',
                    zIndex: 10,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #fef3c7',
                    background: '#fff',
                    color: '#d97706',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s ease',
                    margin: 0,
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef3c7';
                    e.currentTarget.style.borderColor = '#fcd34d';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#fef3c7';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  ‹
                </button>
                <div 
                  className="grocery-carousel" 
                  ref={carouselRef}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: '1rem',
                    width: '100%',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {groceryItems.map((item, index) => {
                  const imageUrl = getImageForItem(item.name);
                  return (
                    <div
                      key={`${item.name}-${index}`}
                      onClick={() => handleItemClick(item)}
                      className="grocery-card"
                      style={{
                        minWidth: '220px',
                        maxWidth: '220px',
                        flexShrink: 0,
                        animation: `scaleIn 0.4s ease-out both`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="grocery-card-image"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '1.5rem',
                          objectFit: 'cover',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          display: 'block',
                          flexShrink: 0,
                        }}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to a placeholder if image fails to load
                          e.currentTarget.src = "https://via.placeholder.com/200x200/fef3c7/d97706?text=" + encodeURIComponent(item.name);
                        }}
                      />
                      <div style={{ textAlign: 'center' }}>
                        <p style={{
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          color: '#000',
                          margin: 0,
                        }}>
                          {item.name}
                        </p>
                        <p style={{
                          marginTop: '0.25rem',
                          fontSize: '0.75rem',
                          color: 'rgba(0, 0, 0, 0.6)',
                          margin: 0,
                        }}>
                          {item.description}
                        </p>
                        {item.price && (
                          <p style={{
                            marginTop: '0.5rem',
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(to right, #d97706, #ea580c)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            margin: 0,
                          }}>
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item.name, item.price);
                        }}
                        style={{
                          width: '100%',
                          borderRadius: '9999px',
                          background: 'linear-gradient(to right, #fbbf24, #fb923c)',
                          padding: '0.625rem 1.25rem',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: '#fff',
                          border: 'none',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to right, #f59e0b, #f97316)';
                          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(to right, #fbbf24, #fb923c)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
                </div>
                <button
                  type="button"
                  className="carousel-button carousel-button-right"
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll right"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: '10px',
                    zIndex: 10,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #fef3c7',
                    background: '#fff',
                    color: '#d97706',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.2s ease',
                    margin: 0,
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef3c7';
                    e.currentTarget.style.borderColor = '#fcd34d';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#fef3c7';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  }}
                >
                  ›
                </button>
              </div>
            ) : (
              <div style={{
                borderRadius: '1rem',
                border: '2px dashed #fcd34d',
                background: 'linear-gradient(to bottom right, rgba(255, 237, 213, 0.5), #ffffff)',
                padding: '3rem',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.6)',
                }}>
                  No groceries found. Search for items to get started.
                </p>
              </div>
            )}
          </section>

          {isCartVisible && (
            <section style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              flex: '1',
              minWidth: '280px',
              maxWidth: '320px',
            }}>
              <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(0, 0, 0, 0.7)',
                  margin: 0,
                }}>
                  Cart
                </p>
                <span style={{
                  borderRadius: '9999px',
                  background: '#fef3c7',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#b45309',
                }}>
                  {visibleCartItems.length} {visibleCartItems.length === 1 ? 'item' : 'items'}
                </span>
              </header>
              {visibleCartItems.length > 0 ? (
              <div className="cart-items-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {visibleCartItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="cart-item-card"
                    style={{
                      animation: `slideIn 0.3s ease-out both`,
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={getImageForItem(item.name)}
                        alt={item.name}
                        className="cart-item-image"
                        loading="lazy"
                      />
                      <div>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: '#000',
                          margin: 0,
                        }}>
                          {item.name}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: 'rgba(0, 0, 0, 0.6)',
                          margin: 0,
                        }}>
                          Qty <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.quantity ?? 0}</span>
                          {item.price && (
                            <> · <span style={{ fontWeight: '600', color: '#b45309' }}>${(item.price * (item.quantity ?? 0)).toFixed(2)}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => adjustQuantity(item.name, -1)}
                        style={{
                          height: '36px',
                          width: '36px',
                          borderRadius: '9999px',
                          border: '2px solid #fef3c7',
                          background: '#fff',
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          color: '#d97706',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fef3c7';
                          e.currentTarget.style.borderColor = '#fcd34d';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.borderColor = '#fef3c7';
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.9)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label={`Decrease ${item.name}`}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustQuantity(item.name, 1)}
                        style={{
                          height: '36px',
                          width: '36px',
                          borderRadius: '9999px',
                          border: '2px solid #fef3c7',
                          background: '#fff',
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          color: '#d97706',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fef3c7';
                          e.currentTarget.style.borderColor = '#fcd34d';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.borderColor = '#fef3c7';
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'scale(0.9)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                {totalPrice > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    borderRadius: '1rem',
                    border: '2px solid #fcd34d',
                    background: 'linear-gradient(to right, #fef3c7, #fed7aa)',
                    padding: '1rem',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'rgba(0, 0, 0, 0.7)',
                        margin: 0,
                      }}>
                        Total
                      </p>
                      <p style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, #d97706, #ea580c)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: 0,
                      }}>
                        ${totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              ) : (
                <div style={{
                  borderRadius: '1rem',
                  border: '2px dashed #fcd34d',
                  background: 'linear-gradient(to bottom right, rgba(255, 237, 213, 0.5), #ffffff)',
                  padding: '2rem',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                  }}>
                    Your cart is empty
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={visibleCartItems.length === 0}
                style={{
                  width: '100%',
                  borderRadius: '1rem',
                  background: visibleCartItems.length === 0 
                    ? '#e5e7eb' 
                    : 'linear-gradient(to right, #f59e0b, #f97316)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold',
                  color: visibleCartItems.length === 0 ? '#9ca3af' : '#fff',
                  border: 'none',
                  boxShadow: visibleCartItems.length === 0 ? 'none' : '0 10px 25px rgba(0, 0, 0, 0.15)',
                  cursor: visibleCartItems.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (visibleCartItems.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #d97706, #ea580c)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (visibleCartItems.length > 0) {
                    e.currentTarget.style.background = 'linear-gradient(to right, #f59e0b, #f97316)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseDown={(e) => {
                  if (visibleCartItems.length > 0) {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Checkout
              </button>
            </section>
          )}
        </div>

        {/* Test Panel for window.pixie methods */}
        <section style={{
          marginTop: '2rem',
          borderRadius: '1.5rem',
          border: '2px solid #bfdbfe',
          background: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.5), rgba(238, 242, 255, 0.5))',
          padding: '1.5rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        }}>
          <header style={{ marginBottom: '1rem' }}>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#1e40af',
              margin: 0,
            }}>
              Test window.pixie Methods
            </p>
            <p style={{
              marginTop: '0.25rem',
              fontSize: '0.75rem',
              color: 'rgba(0, 0, 0, 0.6)',
              margin: 0,
            }}>
              Click buttons to test different window.pixie functionality
            </p>
          </header>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}>
            {[
              { label: 'sendFollowupMessage', onClick: testSendFollowupMessage },
              { label: 'openExternal', onClick: testOpenExternal },
              { label: 'requestModal', onClick: testRequestModal },
              { label: 'requestClose', onClick: testRequestClose },
              { label: 'callTool', onClick: testCallTool },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.onClick}
                style={{
                  borderRadius: '0.75rem',
                  border: '2px solid #bfdbfe',
                  background: '#fff',
                  padding: '0.625rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#1e40af',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("grocery-store-root");
if (!rootElement) {
  throw new Error("Missing grocery-store-root element");
}

createRoot(rootElement).render(<App />);

